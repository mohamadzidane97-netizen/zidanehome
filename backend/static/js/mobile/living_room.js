/* ============================
   🌀 Subcategory Carousel Scroll
============================ */
function scrollCarousel(direction) {
    const container = document.getElementById("subcategory-carousel");
    const scrollAmount = 220; // Adjust scroll speed
  
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  
    updateButtonVisibility(container);
  }
  
  function updateButtonVisibility(container) {
    const leftBtn = document.querySelector(".carousel-btn.left");
    const rightBtn = document.querySelector(".carousel-btn.right");
  
    // Hide left button if at start
    if (container.scrollLeft <= 0) {
      leftBtn.style.opacity = "0.3";
      leftBtn.style.pointerEvents = "none";
    } else {
      leftBtn.style.opacity = "1";
      leftBtn.style.pointerEvents = "auto";
    }
  
    // Hide right button if at end
    if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 5) {
      rightBtn.style.opacity = "0.3";
      rightBtn.style.pointerEvents = "none";
    } else {
      rightBtn.style.opacity = "1";
      rightBtn.style.pointerEvents = "auto";
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("subcategory-carousel");
    if (container) {
      container.addEventListener("scroll", () => updateButtonVisibility(container));
      updateButtonVisibility(container); // Initial update
    }
  });
  
  /* ============================
     🎯 Filtering Logic (Server-Side)
     Clicking a carousel item redirects to Flask
  ============================ */
  document.addEventListener("DOMContentLoaded", () => {
    const carouselItems = document.querySelectorAll(".carousel-item");
  
    carouselItems.forEach((item) => {
      item.addEventListener("click", () => {
        const filter = item.getAttribute("data-filter");
        window.location.href = `/living_room?filter=${filter}`;
      });
    });
  });
  
  /* ============================
     ✨ Active Carousel Highlight
  ============================ */
  document.addEventListener("DOMContentLoaded", () => {
    const activeFilter = new URLSearchParams(window.location.search).get("filter") || "all";
    const carouselItems = document.querySelectorAll(".carousel-item");
  
    carouselItems.forEach((item) => {
      const filter = item.getAttribute("data-filter");
      if (filter === activeFilter) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  });
  