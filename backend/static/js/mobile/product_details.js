/*********************************************
 * 🔹 YOUR ORIGINAL CAROUSEL CODE (unchanged)
 *********************************************/
function scrollProductCarousel(direction) {
    const container = document.getElementById("product-carousel");
    const scrollAmount = container.clientWidth * 0.9;
  
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }
  
  // ✅ Keeps swipe touch working
  const carousel = document.getElementById('product-carousel');
  let isDown = false;
  let startX;
  let scrollLeft;
  
  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  
  carousel.addEventListener('mouseleave', () => isDown = false);
  carousel.addEventListener('mouseup', () => isDown = false);
  
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });
  
  /*********************************************
   * 🔽 ADDITIONS (no touch changes below)
   *********************************************/
  
  /* Rebuilds carousel slides from an array of relative image paths under /static */
  function rebuildCarouselWithImages(images, altPrefix) {
    const container = document.getElementById('product-carousel');
    if (!container || !Array.isArray(images)) return;
  
    const slidesHtml = images.map((src, i) => {
      // normalize path: allow "images/..." or "/static/images/..."
      const normalized = src.startsWith('http')
        ? src
        : '/static/' + src.replace(/^\/?static\/?/, '');
      return `
        <div class="product-carousel-item">
          <img src="${normalized}" alt="${altPrefix} – view ${i + 1}">
        </div>
      `;
    }).join('');
  
    container.innerHTML = slidesHtml;
  
    // Snap back to first slide so user sees the change
    container.scrollTo({ left: 0, behavior: 'smooth' });
  }
  
  /* Fabric swatches: when clicked, replace the whole carousel image set */
  function initFabricSwatches() {
    const swatches = document.querySelectorAll('.fabric-swatches .swatch');
    if (!swatches.length) return;
  
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        // Visual state
        swatches.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
  
        const fabricName = btn.dataset.name || 'Fabric';
        let images = [];
        try {
          images = JSON.parse(btn.dataset.images || '[]');
        } catch (e) {
          console.warn('Invalid data-images on swatch:', e);
        }
  
        if (images.length) {
          rebuildCarouselWithImages(images, fabricName);
        }
  
        // Update WhatsApp CTA with selected fabric
        const orderBtn = document.querySelector('.order-btn');
        const productName = document.querySelector('.product-name')?.textContent?.trim() || 'product';
        if (orderBtn) {
          const text = `Hello I am interested in *${productName}* in *${fabricName}* fabric.\nHere is the product link: ${window.location.href}`;
          orderBtn.href = `https://wa.me/201111057128?text=${encodeURIComponent(text)}`;
        }
      });
    });
  
    // Auto-select the first swatch if present
    swatches[0]?.click();
  }
  
  /* Toggle “See Full Collection” */
  function toggleCollection() {
    const box = document.getElementById('collection-items');
    if (!box) return;
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
  }
  
  /* Toggle “Details” section */
  function toggleDetails() {
    const text = document.getElementById('details-text');
    if (!text) return;
    text.style.display = (text.style.display === 'none' || text.style.display === '') ? 'block' : 'none';
  }
  
  /* Initialize after DOM is ready */
  document.addEventListener('DOMContentLoaded', () => {
    initFabricSwatches();
  });
  

  // Scroll the collection slider
function scrollCollection(direction) {
    const el = document.getElementById('collection-slider');
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }
  
  // Toggle the slider wrapper (keeps backward-compat with old list)
  function toggleCollection() {
    const wrapper = document.getElementById('collection-slider-wrapper');
    const legacy = document.getElementById('collection-items'); // in case you still have the old list
    const target = wrapper || legacy;
    if (!target) return;
    target.style.display = (target.style.display === 'none' || target.style.display === '') ? 'block' : 'none';
  }
  