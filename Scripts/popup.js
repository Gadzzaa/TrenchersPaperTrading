const footerButtons = document.querySelectorAll(".navBut");
const indicator = document.querySelector(".indicator");

const barWidth = 30;

function moveIndicator(el) {
  const parentRect = el.parentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  const elCenter = elRect.left + elRect.width / 2;
  const parentLeft = parentRect.left;

  const barLeft = elCenter - parentLeft - barWidth / 2;

  indicator.style.left = `${barLeft}px`;
}

footerButtons.forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector(".footerButton.active")?.classList.remove("active");
    item.classList.add("active");
    moveIndicator(item);
  });
});

moveIndicator(document.querySelector(".navBut.active"));
