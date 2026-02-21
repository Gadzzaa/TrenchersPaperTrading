export class UIHelper {
  setQualityPreset(qualityValue) {
    document.querySelector(".pageCarousel").style.scrollBehavior =
      qualityValue < 3 ? "auto" : "smooth";

    const buttons = document.querySelectorAll("button");
    if (qualityValue < 2) {
      buttons.forEach((btn) => btn.style.removeProperty("will-change"));
    } else {
      buttons.forEach(
        (btn) =>
          (btn.style.willChange =
            "transform, background-color, color, box-shadow, border-color"),
      );
    }

    if (qualityValue < 1) {
      buttons.forEach((btn) => btn.classList.add("no-shadow"));
    } else {
      buttons.forEach((btn) => btn.classList.remove("no-shadow"));
    }
  }
}
