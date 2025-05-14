document.addEventListener("DOMContentLoaded", () => {
    const topBtn = document.getElementById("topBtn");
    const footer = document.querySelector("footer");

    if (!topBtn) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            topBtn.classList.add("show");
            topBtn.style.display = "flex";
        } else {
            topBtn.classList.remove("show");
            topBtn.style.display = "none";
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
