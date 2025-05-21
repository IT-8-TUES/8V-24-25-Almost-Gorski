document.addEventListener("DOMContentLoaded", () => {
    const topBtn = document.getElementById("topBtn");
    const footer = document.querySelector("footer");

    if (!topBtn) {
        console.error("Top button element with ID 'topBtn' not found.");
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            topBtn.classList.add("show");
        } else {
            topBtn.classList.remove("show");
        }

        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top < window.innerHeight) {
                topBtn.style.bottom = `${window.innerHeight - footerRect.top + 20}px`;
            } else {
                topBtn.style.bottom = "30px";
            }
        }
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

document.addEventListener('DOMContentLoaded', function() {
        var grid = document.querySelector('.gallery');
        if (grid) {
          var msnry = new Masonry(grid, {
            itemSelector: '.gallery-item',
            columnWidth: '.gallery-item',
            percentPosition: true,
            gutter: 22,
            fitWidth: true,
            horizontalOrder: true
          });
          
          imagesLoaded(grid).on('progress', function() {
            msnry.layout();
          });
        }
      });

//функция на Алекс
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

document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevButton = document.querySelector('.prev-button');
  const nextButton = document.querySelector('.next-button');
  const dots = document.querySelectorAll('.dot');
  
  if (track && slides.length) {
    let currentIndex = 0;
    
    function updateCarousel() {
      const offset = currentIndex * 100;
      track.style.transform = `translateX(-${offset}%)`;
      
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });
      
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    }
    
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
      });
    });
    
    updateCarousel();
    
    const autoAdvance = setInterval(nextSlide, 5000);
    
    let touchStartX = 0;
    
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const threshold = 50;
      
      if (touchEndX < touchStartX - threshold) {
        nextSlide();
      } else if (touchEndX > touchStartX + threshold) {
        prevSlide();
      }
    });
  }
});