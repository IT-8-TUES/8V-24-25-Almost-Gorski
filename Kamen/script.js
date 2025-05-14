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
