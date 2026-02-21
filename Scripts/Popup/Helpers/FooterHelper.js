export class FooterHelper {
  static focusButton(button) {
    const index = parseInt(button.dataset.index, 10);
    document.querySelector(".footerButton.active")?.classList.remove("active");
    button.classList.add("active");
    setDisplay(index);
    moveIndicator(button);
  }

  static focusDefaultButton() {
    let defaultButton = document.getElementById("defaultFooterButton");
    moveIndicator(defaultButton);
    setDisplay(defaultButton.dataset.index);
  }
}
