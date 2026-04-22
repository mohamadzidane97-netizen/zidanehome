// --------------------
// Main Menu Toggle
// --------------------
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-list');
const closeBtn = document.querySelector('.nav-list .close-btn');

menuToggle.addEventListener('click', () => {
    navList.classList.add('active'); // slide in main menu
});

closeBtn.addEventListener('click', () => {
    navList.classList.remove('active'); // slide out main menu smoothly
});

// Optional: close main menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
        navList.classList.remove('active');
    }
});

// --------------------
// Submenu Toggle
// --------------------
document.querySelectorAll('.has-submenu > a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // prevent default anchor behavior
        const submenu = link.nextElementSibling; // the UL submenu
        submenu.classList.add('active'); // slide in submenu
    });
});

// Submenu Close Buttons (smooth slide out)
document.querySelectorAll('.submenu .close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
      const submenu = btn.closest('.submenu');

      // Start slide out
      submenu.classList.remove('active');

      // Optional: if you want to hide completely after transition, use transitionend
      submenu.addEventListener('transitionend', function handler() {
          // submenu.style.display = 'none'; // if you want to hide completely
          submenu.removeEventListener('transitionend', handler);
      });
  });
});

// ===============================
// SEARCH FUNCTIONALITY
// ===============================

(() => {
  const openBtn  = document.getElementById("openSearchBtn");
  const overlay  = document.getElementById("mSearch");
  const closeBtn = document.getElementById("closeSearchBtn");
  const input    = document.getElementById("mSearchInput");
  const hint     = document.getElementById("mSearchHint");
  const results  = document.getElementById("mSearchResults");

  // لو أي عنصر ناقص، متعملش حاجة (عشان مايحصلش error)
  if (!openBtn || !overlay || !closeBtn || !input || !hint || !results) return;

  const open = () => {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    results.innerHTML = "";
    hint.textContent = "Type at least 2 letters";
    setTimeout(() => input.focus(), 50);
  };

  const close = () => {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    input.value = "";
    results.innerHTML = "";
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  // click outside (backdrop) to close
  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close === "1") close();
  });

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  // Enter => go to server search
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const q = input.value.trim();
    if (q.length < 2) {
      hint.textContent = "Please type at least 2 letters";
      return;
    }

    // ✅ IMPORTANT: Flask route reads ?query= not ?q=
    window.location.href = `/search?query=${encodeURIComponent(q)}`;
  });

  // hint only
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 2) {
      hint.textContent = "Type at least 2 letters";
      return;
    }
    hint.textContent = `Press Enter to search for “${q}”`;
  });
})();
