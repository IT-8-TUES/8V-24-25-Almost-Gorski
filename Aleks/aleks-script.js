window.addEventListener("scroll", function () {
  const isScrolled = window.scrollY > 50;
  document.body.classList.toggle("scrolled", isScrolled);

  const headerImages = document.querySelectorAll("header .menu a img");
  headerImages.forEach((img) => {
    const src = img.getAttribute("src");
    if (isScrolled) {
      if (src.includes("Inverted")) {
        img.setAttribute("src", src.replace("Inverted", ""));
      }
    } else {
      if (!src.includes("Inverted")) {
        img.setAttribute("src", src.replace(".png", "Inverted.png"));
      }
    }
  });
});

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("expandedImage");
const captionText = document.getElementById("caption");
const closeBtn = document.querySelector(".modal .close");

document.querySelectorAll(".card-image").forEach((img) => {
  img.addEventListener("click", function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  });
});

closeBtn.addEventListener("click", function () {
  modal.style.display = "none";
});

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
