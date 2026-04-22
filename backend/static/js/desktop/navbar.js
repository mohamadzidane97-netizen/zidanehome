let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".nav-desktop");

  if (!navbar) return;

  if (window.scrollY > lastScrollY && window.scrollY > 300) {
    navbar.classList.add("hide");   // hide navbar
  } else {
    navbar.classList.remove("hide"); // show navbar smoothly
  }

  lastScrollY = window.scrollY;
});
