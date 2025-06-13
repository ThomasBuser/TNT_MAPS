window.addEventListener("scroll", () => {
    const footer = document.querySelector("footer");
    if (window.scrollY > 0 && footer.style.display === "none") {
      footer.style.display = "block";
    }
  });