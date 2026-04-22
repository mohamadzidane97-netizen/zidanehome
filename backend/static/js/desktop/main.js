// ===============================
// HERO IMAGE SLIDER (DESKTOP)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".hero-slide");
    if (!slides.length) return; // if there's no slider, don't run
  
    let current = 0;
  
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 5000); // change every 5 seconds
  });

  
  // ===============================
// GENERIC HORIZONTAL CAROUSELS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel-wrapper").forEach((wrapper) => {
      const track = wrapper.querySelector(".carousel");
      const leftBtn = wrapper.querySelector(".carousel-btn.left");
      const rightBtn = wrapper.querySelector(".carousel-btn.right");
      const cards =
        track.querySelectorAll(".section-card").length
          ? track.querySelectorAll(".section-card")
          : track.querySelectorAll(".product-card");
  
      if (!track || !leftBtn || !rightBtn || !cards.length) return;
  
      let index = 0;
  
      const getStep = () => {
        const card = cards[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap || "20");
        return card.offsetWidth + gap;
      };
  
      const updatePosition = () => {
        const step = getStep();
        track.style.transform = `translateX(${-index * step}px)`;
      };
  
      rightBtn.addEventListener("click", () => {
        if (index < cards.length - 1) {
          index++;
          updatePosition();
        }
      });
  
      leftBtn.addEventListener("click", () => {
        if (index > 0) {
          index--;
          updatePosition();
        }
      });
  
      window.addEventListener("resize", updatePosition);
    });
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".signature-carousel-wrapper");
    if (!wrapper) return;
  
    const track = wrapper.querySelector(".signature-carousel");
    const cards = track.querySelectorAll(".signature-card");
    const btnPrev = wrapper.querySelector(".signature-nav-left");
    const btnNext = wrapper.querySelector(".signature-nav-right");
  
    if (cards.length <= 4) {
      // safety: no need for controls
      btnPrev.style.display = "none";
      btnNext.style.display = "none";
      return;
    }
  
    let currentIndex = 0;
    const visibleCount = 4;
  
    function updateCarousel() {
      const firstCard = cards[0];
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const offset = (cardWidth + gap) * currentIndex;
  
      track.style.transform = `translateX(-${offset}px)`;
  
      btnPrev.disabled = currentIndex === 0;
      btnNext.disabled = currentIndex >= cards.length - visibleCount;
    }
  
    btnPrev.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  
    btnNext.addEventListener("click", () => {
      if (currentIndex < cards.length - visibleCount) {
        currentIndex++;
        updateCarousel();
      }
    });
  
    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  });
  