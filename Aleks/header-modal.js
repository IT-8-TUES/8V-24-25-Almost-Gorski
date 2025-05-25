window.addEventListener("scroll", function () {
  const isScrolled = window.scrollY > 50;
  document.body.classList.toggle("scrolled", isScrolled);
  const headerImages = document.querySelectorAll("header .menu a i img");
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
let currentImageIndex = 0;
let galleryImages = [];

document.addEventListener("DOMContentLoaded", function () {
  if (modal) modal.style.display = "none";

  function setupImageClickHandlers() {
    document.querySelectorAll(".card-image, .carousel-image").forEach((img) => {
      img.addEventListener("click", function () {
        openModal(this.src, this.alt, this);
      });
    });

    document.querySelectorAll(".carousel-slide img").forEach((img) => {
      img.addEventListener("click", function () {
        openModal(this.src, this.alt, this);
      });
    });
  }

  setupImageClickHandlers();

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length) {
        setupImageClickHandlers();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const modalPrev = document.querySelector(".modal-prev");
  const modalNext = document.querySelector(".modal-next");

  if (modalPrev) {
    modalPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      navigateModal(-1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener("click", function (e) {
      e.stopPropagation();
      navigateModal(1);
    });
  }
});

function openModal(src, alt, imgElement) {
  let container;
  let images = [];
  if (imgElement) {
    container = imgElement.closest(".carousel, .gallery, .carousel-container");
    if (container) {
      images = Array.from(container.querySelectorAll("img"));
      currentImageIndex = images.indexOf(imgElement);
    } else {
      images = [imgElement];
      currentImageIndex = 0;
    }
    galleryImages = images;
  }

  if (modal) {
    modal.style.display = "flex";
    modalImg.src = src;

    if (alt && alt.trim() !== "") {
      captionText.textContent = alt;
      captionText.style.display = "block";
    } else {
      captionText.style.display = "none";
    }

    document.body.style.overflow = "hidden";

    modalImg.addEventListener("load", function () {
      this.classList.add("loaded");
    });

    setTimeout(() => {
      if (!modalImg.classList.contains("loaded")) {
        modalImg.classList.add("loaded");
      }
    }, 300);
  }
}

function closeModal() {
  if (modal) {
    modalImg.classList.remove("loaded");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 200);
  }
}

function navigateModal(direction) {
  if (galleryImages.length <= 1) return;

  currentImageIndex =
    (currentImageIndex + direction + galleryImages.length) %
    galleryImages.length;

  const newImage = galleryImages[currentImageIndex];
  modalImg.classList.remove("loaded");

  setTimeout(() => {
    modalImg.src = newImage.src;
    captionText.textContent = newImage.alt;
    captionText.style.display =
      newImage.alt && newImage.alt.trim() !== "" ? "block" : "none";

    setTimeout(() => {
      modalImg.classList.add("loaded");
    }, 50);
  }, 200);
}

if (modal) {
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (modal.style.display === "flex") {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        navigateModal(-1);
      } else if (e.key === "ArrowRight") {
        navigateModal(1);
      }
    }
  });
}
