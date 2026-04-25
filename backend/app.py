from flask import Flask, render_template, request, redirect, url_for, session, flash
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import json
from flask import request
from sqlalchemy import func
from flask import request, render_template

def is_mobile_request() -> bool:
    ua = (request.headers.get("User-Agent") or "").lower()
    return any(k in ua for k in ["iphone", "android", "mobile", "ipad"])


app = Flask(__name__)

# ---------------------------------------------------
# BASIC CONFIG (DB & ADMIN)
# ---------------------------------------------------
app.config["SECRET_KEY"] = "CHANGE_ME_TO_A_LONG_RANDOM_STRING"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///zdn_home.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Simple admin password (change it later)
ADMIN_PASSWORD = "ZDN_ADMIN_2025"



db = SQLAlchemy(app)


# ---------------------------------------------------
# DB MODEL: PRODUCT
# ---------------------------------------------------
import json  # make sure this is at the top of app.py

class Product(db.Model):
    """
    Professional product table for all rooms.
    """
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.String(20), nullable=False)      # living, dining, bedroom, kitchen, office, artwork
    category = db.Column(db.String(50), nullable=False)  # sofa, armchair, bed, etc.
    name = db.Column(db.String(150), nullable=False)
    collection = db.Column(db.String(100))
    description = db.Column(db.Text)
    dimensions = db.Column(db.String(150))
    material = db.Column(db.String(150))
    finishes = db.Column(db.Text)          # text paragraph about finishes/fabrics
    fabrics_json = db.Column(db.Text)      # JSON with fabric variants
    images_raw = db.Column(db.Text)        # comma-separated fallback images
    is_active = db.Column(db.Boolean, default=True)
    is_signature = db.Column(db.Boolean, default=False)  # for homepage “Signature”
    is_featured = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def images(self):
        """Fallback images if we don't use fabrics_json."""
        if not self.images_raw:
            return []
        return [s.strip() for s in self.images_raw.split(",") if s.strip()]

    @property
    def fabrics(self):
        """
        Fabric variants from JSON, like:
        [
          {"name": "...", "hex": "#xxxxxx", "images": ["path1", "path2"]},
          ...
        ]
        """
        if not self.fabrics_json:
            return []
        try:
            data = json.loads(self.fabrics_json)
            return data if isinstance(data, list) else []
        except Exception:
            return []



# ---------------------------------------------------
# ADMIN AUTH HELPERS
# ---------------------------------------------------
def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if session.get("is_admin"):
            return f(*args, **kwargs)
        next_url = request.path
        return redirect(url_for("admin_login", next=next_url))
    return wrapper


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password", "")
        next_url = request.form.get("next") or url_for("admin_products")
        if password == ADMIN_PASSWORD:
            session["is_admin"] = True
            flash("Logged in.", "success")
            return redirect(next_url)
        else:
            flash("Wrong password.", "danger")

    next_url = request.args.get("next", url_for("admin_products"))
    return render_template("admin_login.html", next_url=next_url)


@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    flash("Logged out.", "info")
    return redirect(url_for("admin_login"))


# ---------------------------------------------------
# ADMIN: PRODUCTS CRUD
# ---------------------------------------------------
@app.route("/admin/products")
@admin_required
def admin_products():
    products = Product.query.order_by(Product.room.asc(), Product.id.asc()).all()
    return render_template("admin_products_list.html", products=products)


@app.route("/admin/products/new", methods=["GET", "POST"])
@admin_required
def admin_products_new():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        room = request.form.get("room", "").strip()
        category = request.form.get("category", "").strip()

        if not name or not room or not category:
            flash("Name, room, and category are required.", "danger")
            return redirect(url_for("admin_products_new"))

        p = Product(
            name=name,
            room=room,
            category=category,
            collection=request.form.get("collection", "").strip(),
            description=request.form.get("description", "").strip(),
            dimensions=request.form.get("dimensions", "").strip(),
            material=request.form.get("material", "").strip(),
            finishes=request.form.get("finishes", "").strip(),
            fabrics_json=request.form.get("fabrics_json", "").strip(),  # NEW
            images_raw=request.form.get("images_raw", "").strip(),
            is_active=("is_active" in request.form),
            is_signature=("is_signature" in request.form),
            is_featured=("is_featured" in request.form),  # ✅ HERE
        )

        db.session.add(p)
        db.session.commit()
        flash("Product created.", "success")
        return redirect(url_for("admin_products"))

    # GET
    return render_template("admin_products_form.html", product=None)


@app.route("/admin/products/<int:product_id>/edit", methods=["GET", "POST"])
@admin_required
def admin_products_edit(product_id):
    p = Product.query.get_or_404(product_id)

    if request.method == "POST":
        p.name = request.form.get("name", "").strip()
        p.room = request.form.get("room", "").strip()
        p.category = request.form.get("category", "").strip()
        p.collection = request.form.get("collection", "").strip()
        p.description = request.form.get("description", "").strip()
        p.dimensions = request.form.get("dimensions", "").strip()
        p.material = request.form.get("material", "").strip()
        p.finishes = request.form.get("finishes", "").strip()
        p.fabrics_json = request.form.get("fabrics_json", "").strip()  # NEW
        p.images_raw = request.form.get("images_raw", "").strip()
        p.is_active = ("is_active" in request.form)
        p.is_signature = ("is_signature" in request.form)
        p.is_featured = ("is_featured" in request.form)  # ✅ HERE

        if not p.name or not p.room or not p.category:
            flash("Name, room, and category are required.", "danger")
            return redirect(url_for("admin_products_edit", product_id=p.id))

        db.session.commit()
        flash("Product updated.", "success")
        return redirect(url_for("admin_products"))

    # GET
    return render_template("admin_products_form.html", product=p)


@app.route("/admin/products/<int:product_id>/delete", methods=["POST"])
@admin_required
def admin_products_delete(product_id):
    p = Product.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    flash("Product deleted.", "info")
    return redirect(url_for("admin_products"))


# ---------------------------------------------------
# SIGNATURE PRODUCTS FALLBACK (OLD LIST)
# ---------------------------------------------------
SIGNATURE_PRODUCT_IDS = [1, 2, 3, 4, 201]  # used only as fallback if DB is empty


# ---------------------------------------------------
# STATIC PYTHON LIST DATA (legacy / fallback only)
# ---------------------------------------------------
LIVING_PRODUCTS = []  # moved to DB, keep empty list as placeholder

DINING_PRODUCTS = [
    {
        "id": 201,
        "category": "diningtable",
        "name": "Versailles Dining Table",
        "images": ["images/my_catalogue/dining/eden.png"],
        "collection": "Versailles",
        "description": "Elegant carved dining table with marble top.",
        "dimensions": "300x120x78 cm",
        "material": "Beech wood, marble top"
    }
]

BEDROOM_PRODUCTS = [
    {
        "id": 301,
        "category": "bed",
        "name": "Château Bed",
        "images": ["images/bedroom/bed/chateau1.png"],
        "collection": "Château",
        "description": "Upholstered headboard with carved wood details.",
        "dimensions": "180x200 cm",
        "material": "Beech wood, premium fabric"
    },
    {
        "id": 302,
        "category": "wardrobe",
        "name": "Château Wardrobe",
        "images": ["images/bedroom/wardrobe/chateau-ward1.png"],
        "collection": "Château"
    }
]

KITCHEN_PRODUCTS = [
    {
        "id": 401,
        "category": "cabinet",
        "name": "Louvre Cabinet Line",
        "images": ["images/kitchen/cabinet/louvre1.png"],
        "collection": "Louvre"
    },
    {
        "id": 402,
        "category": "island",
        "name": "Louvre Kitchen Island",
        "images": ["images/kitchen/island/louvre-island1.png"],
        "collection": "Louvre"
    }
]

OFFICE_PRODUCTS = [
    {
        "id": 501,
        "category": "desk",
        "name": "Versaille Executive Desk",
        "images": ["images/office/desk/versa-desk1.png"],
        "collection": "Versaille"
    },
    {
        "id": 502,
        "category": "bookcase",
        "name": "Versaille Bookcase",
        "images": ["images/office/bookcase/versa-bc1.png"],
        "collection": "Versaille"
    }
]


# ---------------------------------------------------
# DEVICE DETECTION
# ---------------------------------------------------
def detect_device():
    """Detect if the user is on a mobile or desktop device."""
    user_agent = request.user_agent.string
    return "mobile" if "Mobile" in user_agent else "desktop"


# ---------------------------------------------------
# CONTEXT PROCESSOR
# ---------------------------------------------------
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}


# ---------------------------------------------------
# PAGINATION + CATEGORY HELPERS (legacy)
# ---------------------------------------------------
def paginate(items, page, per_page):
    total = len(items)
    total_pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, total_pages))
    start = (page - 1) * per_page
    end = start + per_page
    return items[start:end], total_pages, page


def render_category_page(template_path, items, endpoint_name, default_filter='all', per_page=10, valid_filters=None):
    """
    Old helper using Python lists. Left here for any legacy templates still using it.
    New room pages use DB via render_room_page.
    """
    selected_filter = request.args.get('filter', default_filter)
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1

    if valid_filters and selected_filter not in valid_filters + ['all']:
        selected_filter = 'all'

    filtered = items if selected_filter == 'all' else [p for p in items if p.get('category') == selected_filter]
    paginated, total_pages, page = paginate(filtered, page, per_page)

    return render_template(
        template_path,
        products=paginated,
        page=page,
        total_pages=total_pages,
        selected_filter=selected_filter,
        current_endpoint=endpoint_name
    )


# ---------------------------------------------------
# PRODUCT HELPERS
# ---------------------------------------------------
def get_all_products():
    # legacy lists only, used for fallback and some related logic
    return LIVING_PRODUCTS + DINING_PRODUCTS + BEDROOM_PRODUCTS + KITCHEN_PRODUCTS + OFFICE_PRODUCTS

def db_product_to_dict(p: Product):
    """
    Convert a Product model into the dict structure your templates expect.
    Uses fabrics images as default if they exist (first fabric), otherwise images_raw.
    """
    # 1) default images from images_raw
    images = p.images

    # 2) if fabrics exist, use first fabric's images as default
    fabrics = p.fabrics or []
    if fabrics and isinstance(fabrics[0], dict):
        first_imgs = fabrics[0].get("images") or []
        if first_imgs:
            images = first_imgs

    return {
        "id": p.id,
        "room": p.room,          # ✅ needed for search + UI
        "name": p.name,
        "category": p.category,
        "collection": p.collection,
        "images": images,
        "description": p.description,
        "dimensions": p.dimensions,
        "material": p.material,
        "finishes": p.finishes,
        "fabrics": fabrics,
    }




def get_product(pid: int):
    # 1) Try to get product from the database
    db_p = Product.query.filter_by(id=pid, is_active=True).first()
    if db_p:
        return db_product_to_dict(db_p)

    # 2) Fallback to old Python lists (for products not yet in DB)
    return next((p for p in get_all_products() if p.get('id') == pid), None)


def get_related_by_collection(product: dict):
    if not product:
        return []

    def normalize(s): return (s or "").strip().lower()

    # include DB products + old list products as a simple approach
    db_items = [db_product_to_dict(p) for p in Product.query.filter_by(is_active=True).all()]
    all_items = db_items + get_all_products()

    coll = normalize(product.get("collection"))
    if coll:
        return [
            p for p in all_items
            if p.get('id') != product.get('id') and normalize(p.get('collection')) == coll
        ]

    prefix = normalize((product.get("name") or "").split()[0])
    return [
        p for p in all_items
        if p.get('id') != product.get('id') and normalize((p.get("name") or "")).startswith(prefix)
    ]


# ---------------------------------------------------
# ROOM CONFIG + GENERIC RENDERER
# ---------------------------------------------------
ROOM_CONFIG = {
    "living": {
        "template": "living_room.html",
        "title": "Living Room",
    },
    "dining": {
        "template": "dining_room.html",
        "title": "Dining Room",
    },
    "bedroom": {
        "template": "bedroom_room.html",
        "title": "Bedroom",
    },
    "office": {
        "template": "office.html",
        "title": "Office",
    },
    "kitchen": {
        "template": "kitchen.html",
        "title": "Kitchen",
    },
    "artwork": {
        "template": "artwork.html",
        "title": "Artwork",
    },
}


def render_room_page(room_key: str):
    """
    Generic renderer for room pages: living, dining, bedroom, office, kitchen, artwork.
    Reads from DB and sends products to the correct template.
    """

    # 1️⃣ Get room config
    cfg = ROOM_CONFIG.get(room_key)
    if not cfg:
        return "Room not configured", 404

    # 2️⃣ Detect device (mobile / desktop)
    folder = detect_device()

    # 3️⃣ Read filter from URL
    selected_filter = request.args.get("filter", "all")

    # 4️⃣ Base query (CASE-INSENSITIVE — this fixes everything)
    query = Product.query.filter(
        func.lower(Product.room) == room_key.lower(),
        Product.is_active.is_(True)
    )

    # 5️⃣ Optional category filter
    if selected_filter != "all":
        query = query.filter_by(category=selected_filter)

    # 6️⃣ Execute query
    db_products = query.order_by(Product.id.asc()).all()

    # 7️⃣ Convert DB objects to dicts
    products = [db_product_to_dict(p) for p in db_products]

    # 8️⃣ Render correct template
    return render_template(
        f"{folder}/{cfg['template']}",
        products=products,
        selected_filter=selected_filter,
        room_key=room_key,
        room_title=cfg["title"],
    )



# ---------------------------------------------------
# ROUTES
# ---------------------------------------------------
@app.route('/')
def index():
    # detect desktop or mobile
    folder = detect_device()

    # ----------------------------
    # SIGNATURE SECTION
    # ----------------------------
    db_signatures = Product.query.filter_by(
        is_active=True,
        is_signature=True
    ).order_by(Product.id.asc()).all()

    if db_signatures:
        signature_products = [db_product_to_dict(p) for p in db_signatures]
    else:
        all_items = get_all_products()
        signature_products = [
            p for p in all_items if p.get("id") in SIGNATURE_PRODUCT_IDS
        ]

    # ----------------------------
    # FEATURED SECTION (INDEPENDENT)
    # ✅ THIS IS WHERE YOUR CODE GOES
    # ----------------------------
    featured_db = Product.query.filter_by(
        is_active=True,
        is_featured=True
    ).order_by(Product.id.asc()).first()

    featured_product = (
        db_product_to_dict(featured_db)
        if featured_db
        else None
    )

    # ----------------------------
    # RENDER PAGE
    # ----------------------------
    return render_template(
        f"{folder}/index.html",
        signature_products=signature_products,
        featured_product=featured_product
    )



@app.route('/sofa')
def sofa():
    # simple route – adjust later if needed
    folder = detect_device()
    return render_template(f"{folder}/sofa.html")


@app.route('/product_category')
def product_category():
    folder = detect_device()
    return render_template(f"{folder}/product_category.html")


@app.route('/living_room')
def living_room():
    return render_room_page("living")


@app.route('/dining_room')
def dining_room():
    return render_room_page("dining")


@app.route('/bedroom')
def bedroom():
    return render_room_page("bedroom")


@app.route('/bedroom_room')
def bedroom_room():
    return render_room_page("bedroom")


@app.route('/office')
def office():
    return render_room_page("office")


@app.route('/kitchen')
def kitchen():
    return render_room_page("kitchen")


@app.route('/artwork')
def artwork():
    return render_room_page("artwork")


@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = get_product(product_id)
    if not product:
        return "Product not found", 404

    related_products = get_related_by_collection(product)
    folder = detect_device()

    return render_template(
        f"{folder}/product_detail.html",
        product=product,
        related_products=related_products
    )



@app.route('/about')
def about():
    folder = detect_device()
    return render_template(f"{folder}/about.html")

@app.route('/collections')
def collections():
    folder = detect_device()
    return render_template(f"{folder}/collections.html")

@app.route('/contact')
def contact():
    folder = detect_device()
    return render_template(f"{folder}/contact.html")


# ---------------------------------------------------
# ---------------------------------------------------
# SEARCH
# ---------------------------------------------------
@app.route('/search')
def search():
    folder = detect_device()
    query_raw = request.args.get('query', '').strip()

    # If empty search → go home
    if not query_raw:
        return redirect(url_for('index'))

    query = query_raw.lower()

    # QUICK SHORTCUTS: exact word → go to room page
    routes = {
        'sofa': 'living_room',
        'living': 'living_room',
        'dining': 'dining_room',
        'table': 'dining_room',
        'bedroom': 'bedroom',
        'bed': 'bedroom',
        'office': 'office',
        'desk': 'office',
        'kitchen': 'kitchen',
        'art': 'artwork',
        'artwork': 'artwork',
    }

    if query in routes:
        return redirect(url_for(routes[query]))

    # 1) DB products
    db_items = [
        db_product_to_dict(p)
        for p in Product.query.filter_by(is_active=True).all()
    ]

    # 2) Old static products (fallback)
    static_items = get_all_products()

    all_items = db_items + static_items

    def matches(prod: dict) -> bool:
        text = " ".join([
            prod.get("name", ""),
            prod.get("collection", ""),
            prod.get("category", ""),
            prod.get("room", ""),
            prod.get("description", "") or "",
        ]).lower()
        return query in text

    results = [p for p in all_items if matches(p)]

    return render_template(
        f"{folder}/search_results.html",
        query=query_raw,
        products=results
    )



# ---------------------------------------------------
# RUN
# ---------------------------------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()   # create products table if not exists
    app.run(host="0.0.0.0", port=5000, debug=True)
