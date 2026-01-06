export class InjectUtils {
  static injectToggleButton(routeHelper) {
    let toggleButton = this.createToggleButton();

    // Toggle logic
    toggleButton.addEventListener("click", () =>
      this.toggleButtonClick(routeHelper),
    );
    document.body.appendChild(toggleButton);
  }

  static createToggleButton() {
    const toggleButton = document.createElement("button");
    toggleButton.id = "trenchersToggleBtn";
    var toggleButtonImage = document.createElement("img");
    toggleButtonImage.src = chrome.runtime.getURL("Images/logo.png");
    toggleButtonImage.alt = "Show/Hide TrenchersPT";
    toggleButton.appendChild(toggleButtonImage);
    return toggleButton;
  }

  static toggleButtonClick(routeHelper) {
    const app = routeHelper?.getAppContainer();
    if (!app) return;
    const toggleButton = document.getElementById("trenchersToggleBtn");
    // --- animate button ---
    toggleButton.classList.remove("clicked"); // reset
    void toggleButton.offsetWidth; // force reflow so animation restarts
    toggleButton.classList.add("clicked");

    if (app.style.display === "none") {
      app.style.display = "block";
      setTimeout(() => (app.style.opacity = "1"), 20);
    } else {
      routeHelper.hideApp();
    }
  }

  static injectStylesheet() {
    const style = this.createStylesheet();
    document.head.appendChild(style);
  }
  static showNotification(message) {
    const notification = document.getElementById("notification");
    const notifText = document.getElementById("notifText");
    if (!notification || !notifText) return;

    clearTimeout(notification._hideTimeout);

    // Update text and trigger pop animation
    notifText.textContent = message;
    if (notification.classList.contains("show")) {
      notifText.classList.remove("pop");
      void notifText.offsetWidth; // Force reflow to restart animation
      notifText.classList.add("pop");
    } else notification.classList.add("show");

    notification._hideTimeout = setTimeout(() => {
      notification.classList.remove("show");
    }, 2000);
  }

  static isWithinBounds(left, top, width, height) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return (
      parseInt(left) + width <= vw &&
      parseInt(top) + height <= vh &&
      parseInt(left) >= 0 &&
      parseInt(top) >= 0
    );
  }

  /**
   * Parses a compact number string like "27.9K", "1B", "123M" into a Number.
   */
  static parseCompactNumber(txt) {
    // 1) Make sure we have a string
    const raw = String(txt).trim();

    // 2) Remove any leading $ or commas
    const cleaned = raw.replace(/[$,]/g, "");

    // 3) Regex: capture number + optional unit (K/M/B)
    const re = /^(\d+(?:\.\d+)?)([KMB])?$/i;
    const m = cleaned.match(re);
    if (!m) {
      const asNum = Number(cleaned);
      if (isNaN(asNum)) {
        throw new Error(`Unrecognized number format: "${txt}"`);
      }
      return asNum;
    }

    // 4) Parse the numeric part
    const num = parseFloat(m[1]);
    const unit = (m[2] || "").toUpperCase();

    // 5) Apply multiplier if needed
    const mult =
      unit === "K" ? 1e3 : unit === "M" ? 1e6 : unit === "B" ? 1e9 : 1;

    return num * mult;
  }
  static createStylesheet() {
    const style = document.createElement("style");
    style.textContent = `
  #TrenchersPaperTrading {
    transition: 
      background var(--anim-time) ease,
      color var(--anim-time) ease,
      border-color var(--anim-time) ease,
      box-shadow var(--anim-time) ease;
  }
  #TrenchersPaperTrading[data-theme="dark"],
  #trenchersToggleBtn{
    --base: 30, 30, 46; /* #1e1e2e */
    --mantle: 24, 24, 37; /* #181825 */
    --crust: 17, 17, 27; /* #11111b */
    --text: 205, 214, 244; /* #cdd6f4 */
    --subtext0: 166, 173, 200; /* #a6adc8 */
    --subtext1: 186, 194, 222; /* #bac2de */
    --overlay0: 108, 112, 134; /* #6c7086 */
    --overlay1: 127, 132, 156; /* #7f849c */
    --overlay2: 147, 153, 178; /* #9399b2 */
    --surface0: 49, 50, 68; /* #313244 */
    --surface1: 69, 71, 90; /* #45475a */
    --surface2: 88, 91, 112; /* #585b70 */
  
    /* Catppuccin Mocha palette additions */
    --rosewater: 245, 224, 220; /* #f5e0dc */
    --flamingo: 242, 205, 205; /* #f2cdcd */
    --pink: 245, 194, 231; /* #f5c2e7 */
    --mauve: 203, 166, 247; /* #cba6f7 */
    --red: 243, 139, 168; /* #f38ba8 */
    --maroon: 235, 160, 172; /* #eba0ac */
    --peach: 250, 179, 135; /* #fab387  */
    --yellow: 250, 224, 129; /* #f9e2af */
    --green: 166, 227, 161; /* #a6e3a1 */
    --teal: 148, 226, 213; /* #94e2d5 */
    --sky: 137, 220, 235; /* #89dceb */
    --sapphire: 115, 160, 250; /* #74c7ec */
    --blue: 137, 180, 250; /* #89b4fa */
    --lavender: 180, 190, 254; /* #b4befe */
  }

  #TrenchersPaperTrading[data-theme="light"]{
      --base: 239, 241, 245; /* #eff1f5 */
      --mantle: 230, 233, 239; /* #e6e9ef */
      --crust: 220, 224, 232; /* #dce0e8 */
      --text: 76, 79, 105; /* #4c4f69 */
      --subtext0: 108, 111, 133; /* #6c6f85 */
      --subtext1: 92, 95, 119; /* #5c5f77 */
      --overlay0: 156, 160, 176; /* #9ca0b0 */
      --overlay1: 140, 143, 161; /* #8c8fa1 */
      --overlay2: 124, 127, 147; /* #7c7f93 */
      --surface0: 204, 208, 218; /* #ccd0da */
      --surface1: 188, 192, 204; /* #bcc0cc */
      --surface2: 172, 176, 190; /* #acb0be */
    
      /* Catppuccin Mocha palette additions */
      --rosewater: 220, 138, 120; /* #dc8a78 */
      --flamingo: 221, 120, 120; /* #dd7878 */
      --pink: 234, 118, 203; /* #ea76cb */
      --mauve: 136, 57, 239; /* #8839ef */
      --red: 210, 15, 57; /* #d20f39 */
      --maroon: 230, 69, 83; /* #e64553 */
      --peach: 254, 100, 11; /* #fe640b  */
      --yellow: 223, 142, 29; /* #df8e1d */
      --green: 64, 160, 43; /* #40a02b */
      --teal: 23, 146, 153; /* #179299 */
      --sky: 4, 165, 229; /* #04a5e5 */
      --sapphire: 32, 159, 181; /* #209fb5 */
      --blue: 30, 102, 245; /* #1e66f5 */
      --lavender: 114, 135, 253; /* #7287fd */
    
    }
  
  .notification {
    position: absolute;
    will-change: transform, opacity;
    transform: translateY(-100%);
    top: 240px;
    width: 350px;
    box-sizing: border-box;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
    background: rgb(var(--base));
    color: rgb(var(--text));
    padding: 16px 32px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    font-family: "Poppins", sans-serif;
    font-size: clamp(0.25rem, 2.5vw, 0.85rem);
    text-align: center;
    z-index: -1;
    transition:
      transform var(--anim-time) cubic-bezier(0.4, 0, 0.2, 1),
      opacity var(--anim-time);
    pointer-events: none;
    opacity: 0.97;
  }
  
  .show {
    transform: translateY(-5px); /* Slide down below container */
    opacity: 1;
  }

  @keyframes pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .notification span.pop {
    display: inline-block;
    transform-origin: center;
    animation: pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

#trenchersToggleBtn {
  position: fixed;
  bottom: 40px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgb(var(--base));
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 20px;
  z-index: 999999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  will-change: transform, opacity;
}

#trenchersToggleBtn:hover {
  transform: scale(1.1); /* subtle grow on hover */
}

#trenchersToggleBtn:active {
  transform: scale(0.9); /* immediate press-down feel */
}

@keyframes toggleClick {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

#trenchersToggleBtn.clicked {
  animation: toggleClick 0.3s ease;
}
  `;
    return style;
  }
}
