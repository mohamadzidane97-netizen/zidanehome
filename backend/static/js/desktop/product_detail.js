document.addEventListener("DOMContentLoaded", function () {
  const mainImg = document.getElementById("pd-main-img");
  const prevBtn = document.querySelector(".pd-main-nav--prev");
  const nextBtn = document.querySelector(".pd-main-nav--next");
  const thumbsContainer = document.querySelector(".pd-thumbs");
  const fabricButtons = Array.from(document.querySelectorAll(".pd-fabric-swatch"));

  if (!mainImg) return;

  let images = [];          // array of image URLs currently used
  let thumbButtons = [];    // current thumbnail buttons
  let currentIndex = 0;

  // -----------------------------------
  // Helpers
  // -----------------------------------

  function setImage(index) {
    if (!images.length) return;

    // wrap index
    currentIndex = (index % images.length + images.length) % images.length;
    mainImg.src = images[currentIndex];

    // update active thumb state
    thumbButtons.forEach((btn) => {
      const idx = Number(btn.dataset.index || 0);
      btn.classList.toggle("is-active", idx === currentIndex);
    });
  }

  function attachThumbEvents() {
    thumbButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index || 0);
        setImage(idx);
      });
    });
  }

  function renderThumbnails() {
    if (!thumbsContainer) return;

    thumbsContainer.innerHTML = "";
    thumbButtons = [];

    images.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pd-thumb-btn";
      btn.dataset.index = String(i);
      btn.dataset.img = src;

      const img = document.createElement("img");
      img.src = src;
      img.alt = `Thumbnail ${i + 1}`;
      img.loading = "lazy";

      btn.appendChild(img);
      thumbsContainer.appendChild(btn);
      thumbButtons.push(btn);
    });

    attachThumbEvents();
  }

  function setImages(newImages) {
    images = (newImages || []).filter(Boolean);
    if (!images.length) return;

    renderThumbnails();
    setImage(0);
  }

  // -----------------------------------
  // Fabrics logic
  // -----------------------------------

  function initFabrics() {
    if (!fabricButtons.length) return false;

    fabricButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // active state on swatches
        fabricButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        // read images from data-images (pipe separated)
        const imgs = (btn.dataset.images || "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);

        setImages(imgs);
      });
    });

    // initial fabric images from first swatch
    const firstBtn = fabricButtons[0];
    if (firstBtn) {
      firstBtn.classList.add("is-active");
      const firstImgs = (firstBtn.dataset.images || "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      if (firstImgs.length) {
        setImages(firstImgs);
        return true;
      }
    }

    return false;
  }

  // -----------------------------------
  // Fallback (no fabrics)
  // -----------------------------------

  function initFromExistingThumbs() {
    const initialThumbs = Array.from(document.querySelectorAll(".pd-thumb-btn"));
    if (!initialThumbs.length) return false;

    images = initialThumbs.map((btn, i) => {
      const src = btn.dataset.img || (btn.querySelector("img") && btn.querySelector("img").src) || "";
      btn.dataset.index = String(i);
      return src;
    }).filter(Boolean);

    thumbButtons = initialThumbs;
    attachThumbEvents();
    if (images.length) setImage(0);
    return images.length > 0;
  }

  function initFromMainImage() {
    const src = mainImg.getAttribute("src");
    if (!src) return false;

    images = [src];
    renderThumbnails();  // will create one thumb
    setImage(0);
    return true;
  }

  // -----------------------------------
  // Arrows
  // -----------------------------------

  function initArrows() {
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        setImage(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        setImage(currentIndex + 1);
      });
    }
  }

  // -----------------------------------
  // Init flow
  // -----------------------------------

  // 1) Try fabrics first (if exist)
  const fabricsInitialized = initFabrics();

  // 2) If no fabrics or no images from fabrics → use existing thumbnails
  if (!fabricsInitialized) {
    const thumbsInitialized = initFromExistingThumbs();

    // 3) If no thumbs either → just use main image
    if (!thumbsInitialized) {
      initFromMainImage();
    }
  }

  // 4) Enable arrows
  initArrows();
});
