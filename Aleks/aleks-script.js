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

document.addEventListener("DOMContentLoaded", function () {
  if (modal) modal.style.display = "none";
  document.querySelectorAll(".card-image, .carousel-image").forEach((img) => {
    img.addEventListener("click", function () {
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";

      modalImg.src = this.src;

      captionText.innerHTML = this.alt;
    });
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

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".carousel")) {
    const track = document.querySelector(".carousel-track");

    const slides = Array.from(track.children);

    const nextButton = document.querySelector(".next-button");

    const prevButton = document.querySelector(".prev-button");

    const dotsNav = document.querySelector(".carousel-nav");

    const dots = Array.from(dotsNav.children);

    const slideWidth = slides[0].getBoundingClientRect().width;

    slides.forEach((slide, index) => {
      slide.style.left = slideWidth * index + "px";
    });

    const moveToSlide = (track, currentSlide, targetSlide) => {
      slides.forEach((slide) => {
        slide.classList.remove("current-slide");
      });

      targetSlide.classList.add("current-slide");
    };

    const updateDots = (currentDot, targetDot) => {
      currentDot.classList.remove("current-slide");

      targetDot.classList.add("current-slide");
    };

    const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
      if (targetIndex === 0) {
        prevButton.style.opacity = "0.5";

        nextButton.style.opacity = "1";
      } else if (targetIndex === slides.length - 1) {
        prevButton.style.opacity = "1";

        nextButton.style.opacity = "0.5";
      } else {
        prevButton.style.opacity = "1";

        nextButton.style.opacity = "1";
      }
    };

    prevButton.addEventListener("click", (e) => {
      const currentSlide = track.querySelector(".current-slide");

      const prevSlide =
        currentSlide.previousElementSibling || slides[slides.length - 1];

      const currentDot = dotsNav.querySelector(".current-slide");

      const prevDot =
        currentDot.previousElementSibling || dots[dots.length - 1];

      const prevIndex = slides.findIndex((slide) => slide === prevSlide);

      moveToSlide(track, currentSlide, prevSlide);

      updateDots(currentDot, prevDot);

      hideShowArrows(slides, prevButton, nextButton, prevIndex);
    });

    nextButton.addEventListener("click", (e) => {
      const currentSlide = track.querySelector(".current-slide");

      const nextSlide = currentSlide.nextElementSibling || slides[0];

      const currentDot = dotsNav.querySelector(".current-slide");

      const nextDot = currentDot.nextElementSibling || dots[0];

      const nextIndex = slides.findIndex((slide) => slide === nextSlide);

      moveToSlide(track, currentSlide, nextSlide);

      updateDots(currentDot, nextDot);

      hideShowArrows(slides, prevButton, nextButton, nextIndex);
    });

    dotsNav.addEventListener("click", (e) => {
      const targetDot = e.target.closest("button");

      if (!targetDot) return;

      const currentSlide = track.querySelector(".current-slide");

      const currentDot = dotsNav.querySelector(".current-slide");

      const targetIndex = dots.findIndex((dot) => dot === targetDot);

      const targetSlide = slides[targetIndex];

      moveToSlide(track, currentSlide, targetSlide);

      updateDots(currentDot, targetDot);

      hideShowArrows(slides, prevButton, nextButton, targetIndex);
    });

    let carouselInterval = setInterval(() => {
      const currentSlide = track.querySelector(".current-slide");

      const nextSlide = currentSlide.nextElementSibling || slides[0];

      const currentDot = dotsNav.querySelector(".current-slide");

      const nextDot = currentDot.nextElementSibling || dots[0];

      const nextIndex = slides.findIndex((slide) => slide === nextSlide);

      moveToSlide(track, currentSlide, nextSlide);

      updateDots(currentDot, nextDot);

      hideShowArrows(slides, prevButton, nextButton, nextIndex);
    }, 5000);

    const carouselContainer = document.querySelector(".carousel");

    carouselContainer.addEventListener("mouseenter", () => {
      clearInterval(carouselInterval);
    });

    carouselContainer.addEventListener("mouseleave", () => {
      carouselInterval = setInterval(() => {
        const currentSlide = track.querySelector(".current-slide");

        const nextSlide = currentSlide.nextElementSibling || slides[0];

        const currentDot = dotsNav.querySelector(".current-slide");

        const nextDot = currentDot.nextElementSibling || dots[0];

        const nextIndex = slides.findIndex((slide) => slide === nextSlide);

        moveToSlide(track, currentSlide, nextSlide);

        updateDots(currentDot, nextDot);

        hideShowArrows(slides, prevButton, nextButton, nextIndex);
      }, 5000);
    });
  }
});
