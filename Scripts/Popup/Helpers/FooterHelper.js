export class FooterHelper {
    static focusButton(button) {
        const index = parseInt(button.dataset.index, 10);
        document.querySelector(".footerButton.active")?.classList.remove("active");
        button.classList.add("active");
        FooterHelper.#setDisplay(index);
        FooterHelper.#moveIndicator(button);
    }

    static focusDefaultButton() {
        let defaultButton = document.getElementById("defaultFooterButton");
        FooterHelper.#moveIndicator(defaultButton);
        FooterHelper.#setDisplay(defaultButton.dataset.index);
    }

    static #setDisplay(index) {
        const carousel = document.querySelector(".pageCarousel");
        const items = document.querySelectorAll(".menuItem");
        /*  document.querySelector(".menuItem.active")?.classList.remove("active");
        document.getElementById(button.dataset.menu).classList.add("active"); */
        const itemWidth = items[0].offsetWidth;
        const animTime = getComputedStyle(document.documentElement)
            .getPropertyValue("--anim-time")
            .trim();

        if (parseFloat(animTime) * 10 < 3)
            carousel.scrollTo({
                left: itemWidth * index,
                behavior: "instant",
            });
        else
            carousel.scrollTo({
                left: itemWidth * index,
                behavior: "smooth",
            });
    }

    static #moveIndicator(el) {
        let indicator = document.querySelector(".indicator");
        let barWidth = 30;
       
        const parentRect = el.parentElement.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const elCenter = elRect.left + elRect.width / 2;
        const parentLeft = parentRect.left;

        const barLeft = elCenter - parentLeft - barWidth / 2;

        if (!indicator) {
            console.error("Indicator not found.");
            return;
        }
        indicator.style.left = `${barLeft}px`;
    }
}
