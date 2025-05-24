window.addEventListener("scroll", function () {
  const isScrolled = window.scrollY > 50;
  document.body.classList.toggle("scrolled", isScrolled);
  const headerImages = document.querySelectorAll("header .menu a i const loadImage = () => {
         
              img.style.transform = "translateZ(0) scale(1.0000001)";
              img.style.willChange = "transform, opacity";
              
            
              void img.offsetWidth;
              
            
              img.classList.add('loaded');
              slide.classList.remove('loading');
            };eaderImages.forEach((img) => {
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

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
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

    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modalImg.src = src;
    modalImg.alt = alt || "";
    captionText.innerHTML = alt || "";
    updateModalNavStatus();

    document.addEventListener("keydown", handleModalKeyNav);
    document.querySelectorAll(".carousel").forEach((carousel) => {
      carousel.classList.add("paused");
    });
  }
  
  function navigateModal(direction) {
    if (galleryImages.length <= 1) return;

    currentImageIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
    const newImage = galleryImages[currentImageIndex];
    modalImg.style.opacity = "0.3";

    setTimeout(() => {
      modalImg.src = newImage.src;
      modalImg.alt = newImage.alt || "";
      captionText.innerHTML = newImage.alt || "";
      modalImg.style.opacity = "1";
      updateModalNavStatus();
    }, 200);
  }
  
  function updateModalNavStatus() {
    if (galleryImages.length > 1) {
      const navStatus = document.querySelector(".modal-controls");
      if (navStatus) {
        navStatus.style.display = "flex";
      }
    } else {
      const navStatus = document.querySelector(".modal-controls");
      if (navStatus) {
        navStatus.style.display = "none";
      }
    }
  }
  
  handleModalKeyNav = function (e) {
    if (modal.style.display === "flex") {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateModal(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateModal(1);
      } else if (e.key === "Escape") {
        closeModal();
      }
    }
  };
});

closeBtn.addEventListener("click", function () {
  closeModal();
});

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    closeModal();
  }
});

let handleModalKeyNav;

function closeModal() {
  modal.style.display = "none";
  if (handleModalKeyNav) {
    document.removeEventListener("keydown", handleModalKeyNav);
  }
  document.querySelectorAll(".carousel").forEach((carousel) => {
    carousel.classList.remove("paused");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const carousels = document.querySelectorAll(".carousel");

  if (carousels.length === 0) return;

  carousels.forEach((carousel, carouselIndex) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = carousel.querySelectorAll(".carousel-slide");
    const prevButton = carousel.querySelector(".prev-button");
    const nextButton = carousel.querySelector(".next-button");
    const dotsContainer = carousel.parentElement.querySelector(".carousel-dots");
    const dots = dotsContainer ? dotsContainer.querySelectorAll(".dot") : [];
    const carouselId = `carousel-${carouselIndex}`;
    
    carousel.setAttribute("id", carouselId);
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "Image Gallery");
    track.setAttribute("role", "presentation");
    
    slides.forEach((slide, i) => {
      const slideId = `${carouselId}-slide-${i}`;
      slide.setAttribute("id", slideId);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `Slide ${i + 1} of ${slides.length}`);
    });
    
    const progressContainer = document.createElement("div");
    progressContainer.className = "carousel-progress";
    const progressBar = document.createElement("div");
    progressBar.className = "carousel-progress-bar";
    progressContainer.appendChild(progressBar);
    carousel.appendChild(progressContainer);

    const counter = document.createElement("div");
    counter.className = "carousel-counter";
    counter.textContent = `1/${slides.length}`;
    counter.setAttribute("aria-hidden", "true");
    carousel.appendChild(counter);

    if (track && slides.length) {
      let currentIndex = 0;
      let autoAdvanceInterval;
      let isDragging = false;
      let startPos = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;

      function setupCarousel() {
        slides.forEach((slide, index) => {
          slide.style.position = "relative";
          slide.style.left = "0";
          slide.style.width = "100%";
          slide.style.transform = `translateX(${index * 100}%)`;
          slide.classList.add("loading");

          const img = slide.querySelector("img");
          if (img) {

            if (index < 2) {
              img.setAttribute("loading", "eager");
            } else {
              img.setAttribute("loading", "lazy");
            }            const loadImage = () => {

              if (img.src.includes("koncheto_2") || img.src.includes("koncheto_5")) {
                img.style.imageRendering = "-webkit-optimize-contrast";
              }

              img.style.transform = "translateZ(0)";
              img.style.willChange = "transform, opacity";

              void img.offsetWidth;
              
              img.classList.add("loaded");
              slide.classList.remove("loading");

              if (img.src.includes("koncheto_2") || img.src.includes("koncheto_4") || img.src.includes("koncheto_6")) {
                setTimeout(() => {
                  img.style.opacity = "1";
                  img.style.visibility = "visible";
                }, 50);
              }
            };

            if (img.complete) {
              loadImage();
            } else {
              img.addEventListener("load", loadImage);
            }        
            const fullscreenIcon = document.createElement("div");
            fullscreenIcon.className = "fullscreen-icon";
            fullscreenIcon.setAttribute("title", "View full size");
            fullscreenIcon.setAttribute("aria-label", "View full size image");
            fullscreenIcon.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            `;

            fullscreenIcon.addEventListener("click", function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof openModal === "function" && modal) {
                openModal(img.src, img.alt, img);
              } else {
                console.error("Modal or openModal function not available");
                window.open(img.src, '_blank');
              }
            });

            const existingIcons = slide.querySelectorAll('.fullscreen-icon');
            existingIcons.forEach(icon => icon.remove());
            
            slide.appendChild(fullscreenIcon);

          }
        });
      }

      function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, index) => {
          if (index === currentIndex) {
            slide.classList.add("active");            slide.setAttribute("aria-hidden", "false");

            const img = slide.querySelector("img");
            if (img) {
              if (!img.classList.contains("loaded")) {
                slide.classList.add("loading");
              }
            }

            const indicesToPreload = [
              (index + 1) % slides.length,
              (index - 1 + slides.length) % slides.length,
              (index + 2) % slides.length,
              (index - 2 + slides.length) % slides.length
            ];

            const uniqueIndices = [...new Set(indicesToPreload)].filter(i => i !== index);

            uniqueIndices.forEach((preloadIndex) => {
              const slideToPreload = slides[preloadIndex];
              if (slideToPreload) {
                const imgToPreload = slideToPreload.querySelector("img");
                if (imgToPreload && !imgToPreload.complete) {
                  const preloadImg = new Image();
                  preloadImg.src = imgToPreload.src;
                }
              }
            });
          } else {
            slide.classList.remove("active");
            slide.style.opacity = "0.6";
            slide.setAttribute("aria-hidden", "true");
          }
        });

        if (dots.length) {
          dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
            dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
            dot.setAttribute("aria-label", `Go to slide ${index + 1}${index === currentIndex ? " (current slide)" : ""}`);
          });
        }

        const progressBar = carousel.querySelector(".carousel-progress-bar");
        if (progressBar) {
          const progress = ((currentIndex + 1) / slides.length) * 100;
          progressBar.style.width = `${progress}%`;
        }

        const counter = carousel.querySelector(".carousel-counter");
        if (counter) {
          counter.textContent = `${currentIndex + 1}/${slides.length}`;
        }

        carousel.setAttribute("aria-label", `Image ${currentIndex + 1} of ${slides.length}`);
        carousel.setAttribute("aria-live", "polite");
        setTimeout(() => {
          carousel.setAttribute("aria-live", "off");
        }, 1000);

        restartAutoAdvance();
      }

      function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
      }

      function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      }

      function restartAutoAdvance() {
        if (autoAdvanceInterval) {
          clearInterval(autoAdvanceInterval);
        }

        if (!carousel.classList.contains("paused")) {
          autoAdvanceInterval = setInterval(nextSlide, 5000);
        }
      }

      if (prevButton) prevButton.addEventListener("click", prevSlide);
      if (nextButton) nextButton.addEventListener("click", nextSlide);

      if (dots.length) {
        dots.forEach((dot, index) => {
          dot.setAttribute("tabindex", "0");
          dot.setAttribute("role", "button");
          dot.setAttribute("aria-label", `Slide ${index + 1}`);

          dot.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
          });

          dot.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              currentIndex = index;
              updateCarousel();
            }
          });
        });
      }

      function touchStart(e) {
        isDragging = true;
        startPos = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
        track.style.transition = "none";
      }

      function touchMove(e) {
        if (!isDragging) return;

        if (e.type.includes("touch")) {
          e.preventDefault();
        }

        const currentPosition = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
        const diff = currentPosition - startPos;
        const slideWidth = carousel.offsetWidth;
        const maxDrag = slideWidth * 0.3;
        const boundedDiff = Math.max(Math.min(diff, maxDrag), -maxDrag);
        currentTranslate = prevTranslate + boundedDiff;
        track.style.transform = `translateX(${currentTranslate - currentIndex * slideWidth}px)`;
      }

      function touchEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        track.style.transition = "transform 0.4s ease";

        const currentPosition = e.type.includes("mouse") ? e.pageX : e.changedTouches[0].clientX;
        const diff = currentPosition - startPos;
        const threshold = carousel.offsetWidth * 0.2;

        if (diff < -threshold) {
          nextSlide();
        } else if (diff > threshold) {
          prevSlide();
        } else {
          updateCarousel();
        }

        prevTranslate = currentIndex * carousel.offsetWidth;
      }

      track.addEventListener("touchstart", touchStart, { passive: true });
      track.addEventListener("touchmove", touchMove, { passive: false });
      track.addEventListener("touchend", touchEnd);
      track.addEventListener("mousedown", touchStart);
      track.addEventListener("mousemove", touchMove);
      track.addEventListener("mouseup", touchEnd);
      track.addEventListener("mouseleave", touchEnd);
      track.addEventListener("contextmenu", (e) => e.preventDefault());

      carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "h" || e.key === "k") {
          e.preventDefault();
          prevSlide();
        }
        if (e.key === "ArrowRight" || e.key === "l" || e.key === "j") {
          e.preventDefault();
          nextSlide();
        }
        if (e.key === "Home") {
          e.preventDefault();
          currentIndex = 0;
          updateCarousel();
        }
        if (e.key === "End") {
          e.preventDefault();
          currentIndex = slides.length - 1;
          updateCarousel();
        }
      });

      carousel.setAttribute("tabindex", "0");

      setupCarousel();
      updateCarousel();
      restartAutoAdvance();

      carousel.addEventListener("mouseenter", () => {
        clearInterval(autoAdvanceInterval);
      });

      carousel.addEventListener("mouseleave", restartAutoAdvance);
    }
  });

  function addTouchInstructionHint() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile && carousel.querySelector(".carousel-slide")) {
      const touchHint = document.createElement("div");
      touchHint.className = "touch-instruction";
      touchHint.innerHTML = '<div class="swipe-icon"></div>Swipe to navigate';
      carousel.appendChild(touchHint);

      setTimeout(() => {
        touchHint.style.opacity = "0";
        setTimeout(() => {
          if (touchHint.parentNode === carousel) {
            carousel.removeChild(touchHint);
          }
        }, 1000);
      }, 3000);

      carousel.addEventListener("touchstart", () => {
        touchHint.style.opacity = "0";
        setTimeout(() => {
          if (touchHint.parentNode === carousel) {
            carousel.removeChild(touchHint);
          }
        }, 300);
      }, { once: true });
    }
  }

  addTouchInstructionHint();
});
