/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./Scripts/Injection/InjectUtils.js
class InjectUtils {
    /**
     * @param {RouteHelper} routeHelper
     */
    static injectToggleButton(routeHelper) {
        let toggleButton = this.createToggleButton();

        // Toggle logic
        toggleButton.addEventListener("click", () =>
            this.toggleButtonClick(routeHelper),
        );
        document.body.appendChild(toggleButton);
    }

    /**
     * @returns {HTMLButtonElement} -
     */
    static createToggleButton() {
        const toggleButton = document.createElement("button");
        toggleButton.id = "trenchersToggleBtn";
        let toggleButtonImage = document.createElement("img");
        toggleButtonImage.src = chrome.runtime.getURL("Images/logo.png");
        toggleButtonImage.alt = "Show/Hide TrenchersPT";
        toggleButton.appendChild(toggleButtonImage);
        return toggleButton;
    }

    /**
     * @param {RouteHelper} routeHelper -
     */
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

    /**
     * Injects the stylesheet into the document head.
     * */
    static injectStylesheet() {
        const style = this.createStylesheet();
        document.head.appendChild(style);
    }

    /**
     * @param {string} message - Notification message to show
     */
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

    /**
     * @param {number} left -
     * @param {number} top -
     * @param {number} width -
     * @param {number} height -
     * @returns {boolean} -
     */
    static isWithinBounds(left, top, width, height) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return (
            left + width <= vw &&
            top + height <= vh &&
            left >= 0 &&
            top >= 0
        );
    }

    /**
     * @returns {HTMLStyleElement} -
     */
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

;// ./Scripts/Injection/DragHelper.js
class DragHelper {
    /**
     * @param {HTMLDivElement} target - Container to be made draggable
     * @param {HTMLDivElement} handle - Element that initiates the drag
     * @param {HTMLIFrameElement} iframe - Element to disable pointer events on during drag
     */
    static makeDraggable(target, handle, iframe) {
        const helper = {
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
            target,
            handle,
            iframe,
            dragOverlay: null,
        };

        helper.dragOverlay = document.createElement("div");
        Object.assign(helper.dragOverlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "9999999",
            cursor: "grabbing",
            display: "none",
        });

        const resetPosition = () => {
            helper.target.style.left = "100px";
            helper.target.style.top = "100px";
            localStorage.setItem("draggableLeft", "100px");
            localStorage.setItem("draggableTop", "100px");
        };

        const startDrag = (e) => {
            helper.isDragging = true;
            helper.offsetX = e.clientX - helper.target.getBoundingClientRect().left;
            helper.offsetY = e.clientY - helper.target.getBoundingClientRect().top;
            document.body.style.userSelect = "none";

            helper.target.style.transition = "opacity 0.15s ease";
            helper.target.style.opacity = "0.8";
            helper.target.style.transform = "scale(0.98)";

            helper.dragOverlay.style.display = "block";
            if (helper.iframe) helper.iframe.style.pointerEvents = "none";
        };

        const onDrag = (e) => {
            if (!helper.isDragging) return;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const targetRect = helper.target.getBoundingClientRect();

            const newLeft = e.clientX - helper.offsetX;
            const newTop = e.clientY - helper.offsetY;

            const clampedLeft = Math.min(
                Math.max(0, newLeft),
                viewportWidth - targetRect.width,
            );
            const clampedTop = Math.min(
                Math.max(0, newTop),
                viewportHeight - targetRect.height,
            );

            helper.target.style.left = `${clampedLeft}px`;
            helper.target.style.top = `${clampedTop}px`;
        };

        const endDrag = () => {
            if (!helper.isDragging) return;
            helper.isDragging = false;

            document.body.style.userSelect = "";
            helper.target.style.opacity = "1";
            helper.target.style.transform = "scale(1)";
            helper.handle.style.width = "24px";
            helper.handle.style.height = "16px";
            helper.handle.style.left = "174.5px";
            helper.handle.style.top = "6px";

            helper.dragOverlay.style.display = "none";
            if (helper.iframe) helper.iframe.style.pointerEvents = "auto";

            localStorage.setItem("draggableLeft", helper.target.style.left);
            localStorage.setItem("draggableTop", helper.target.style.top);
        };

        helper.handle.addEventListener("dblclick", resetPosition);
        helper.handle.addEventListener("pointerdown", startDrag);
        helper.dragOverlay.addEventListener("pointermove", onDrag, {
            passive: true,
        });
        helper.dragOverlay.addEventListener("pointerup", endDrag);

        document.body.appendChild(helper.dragOverlay);
    }
}

;// ./Scripts/Injection/InjectHelper.js



class InjectHelper {
    #appContainer = null;

    /**
     * Creates app container, grabs app position, creates iframe and appends it to the body.
     * Loads settings and creates settings event listeners.
     * Creates notification container and move handle for dragging.
     * Fades in the app container.
     * */
    constructor() {
        try {
            this.createAppContainer();
            this.getAppPosition();
            const iframe = this.createAppIframe();
            document.body.appendChild(this.#appContainer);

            this.loadSettings();
            this.createSettingsEvents();

            this.createNotificationContainer();
            const moveHandle = this.createMoveHandle();
            DragHelper.makeDraggable(this.#appContainer, moveHandle, iframe);

            setTimeout(() => {
                this.#appContainer.style.opacity = "1";
            }, 50);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @returns {HTMLDivElement} - App container element.
     */
    getAppContainer() {
        return this.#appContainer;
    }

    /**
     * Sets app container display to none after fading out.
     * */
    hideApp() {
        if (this.#appContainer) {
            this.#appContainer.style.opacity = "0";
            setTimeout(() => (this.#appContainer.style.display = "none"), 300); // match your fade duration
        }
    }

    /**
     * Removes app container from the DOM.
     * */
    removeApp() {
        if (this.#appContainer) {
            this.#appContainer.remove();
        }
    }

    /**
     * Creates the main app container with styles.
     * */
    createAppContainer() {
        this.#appContainer = document.createElement("div");
        this.#appContainer.id = "TrenchersPaperTrading";
        Object.assign(this.#appContainer.style, {
            position: "fixed",
            top: "100px",
            left: "100px",
            width: "350px",
            height: "500px",
            zIndex: "99999",
            background: "transparent",
            borderRadius: "12px",
            overflow: "hidden",
            userSelect: "none",
            opacity: "0",
            transition: "opacity 0.3s ease",
        });
    }

    /**
     * Creates the iframe for the app and appends it to the app container.
     * @returns {HTMLIFrameElement} -
     */
    createAppIframe() {
        const appIframe = document.createElement("iframe");
        appIframe.src = chrome.runtime.getURL("dashboard.html");
        Object.assign(appIframe.style, {
            width: "100%",
            height: "240px",
            border: "none",
            borderRadius: "12px",
            zIndex: "2",
        });

        this.#appContainer.appendChild(appIframe);
        return appIframe;
    }

    createNotificationContainer() {
        const notification = document.createElement("div");
        notification.id = "notification";
        notification.className = "notification";

        // Create span for text
        const notifText = document.createElement("span");
        notifText.id = "notifText";
        notification.appendChild(notifText);

        this.#appContainer.appendChild(notification);
    }

    createMoveHandle() {
        const moveHandle = document.createElement("div");
        Object.assign(moveHandle.style, {
            position: "absolute",
            top: "6px",
            left: "174.5px",
            width: "24px",
            height: "16px",
            cursor: "grab",
            background: "transparent",
            zIndex: "999999",
        });
        this.#appContainer.appendChild(moveHandle);
        return moveHandle;
    }

    getAppPosition() {
        const savedLeft = localStorage.getItem("draggableLeft");
        const savedTop = localStorage.getItem("draggableTop");

        chrome.storage.local.get("saveWindowPos", ({saveWindowPos}) => {
            if (!saveWindowPos) return;
            if (
                savedLeft &&
                savedTop &&
                InjectUtils.isWithinBounds(parseInt(savedLeft), parseInt(savedTop), 350, 240) // your app size
            ) {
                this.#appContainer.style.left = savedLeft;
                this.#appContainer.style.top = savedTop;
            }
        });
    }

    loadSettings() {
        chrome.storage.local.get("animation", ({animation}) => {
            if (!animation) animation = 3;
            document.documentElement.style.setProperty(
                "--anim-time",
                `${animation / 10}s`,
            );
        });

        chrome.storage.local.get("theme", ({theme}) => {
            if (theme) {
                this.#appContainer.setAttribute("data-theme", theme);
            } else this.#appContainer.setAttribute("data-theme", "dark");
        });
    }

    createSettingsEvents() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && changes.animation) {
                document.documentElement.style.setProperty(
                    "--anim-time",
                    `${changes.animation.newValue / 10}s`,
                );
            }
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && changes.theme) {
                this.#appContainer.setAttribute("data-theme", changes.theme.newValue);
            }
        });
    }
}

;// ./Scripts/Injection/RouteHelper.js


class RouteHelper {
  #lastPathname = "";
  #injHelper = null;

  /**
   * @returns {HTMLDivElement} -
   */
  getAppContainer() {
    return this.#injHelper?.getAppContainer();
  }

  /**
   * @param {string} baseSegment - Trim URL Segment
   * @returns {string} - Decoded URL Segment after baseSegment
   */
  static getURLSegmentAfter(baseSegment) {
    const parts = new URL(window.location.href).pathname
      .split("/")
      .filter(Boolean);
    const idx = parts.indexOf(baseSegment);
    return idx >= 0 && parts.length > idx + 1
      ? decodeURIComponent(parts[idx + 1])
      : null;
  }

  /**
   * Handles route changes and injects or removes the app accordingly.
   * */
  handleRouteChange() {
    const currentPath = location.pathname;
    const isOnMemePage = currentPath.startsWith("/meme");
    this.#lastPathname = currentPath;

    if (isOnMemePage) {
      if (!this.#injHelper) this.#injHelper = new InjectHelper();
      else {
        const container = this.#injHelper.getAppContainer();
        if (container) container.style.display = "block";
      }
    } else {
      if (this.#injHelper) {
        this.#injHelper.removeApp();
        this.#injHelper = null;
      }
    }
  }

  /**
   * Monitors route changes in a single-page.
   * */
  monitorRouteChanges() {
    const observer = new MutationObserver(() => {
      if (location.pathname !== this.#lastPathname) {
        this.#lastPathname = location.pathname;
        this.handleRouteChange();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("popstate", () => {
      if (location.pathname !== this.#lastPathname) {
        this.#lastPathname = location.pathname;
        this.handleRouteChange();
      }
    });

    window.addEventListener("hashchange", () => {
      if (location.pathname !== this.#lastPathname) {
        this.#lastPathname = location.pathname;
        this.handleRouteChange();
      }
    });

    this.handleRouteChange();
  }

  /**
   * Hides the app container.
   * */
  handleHideApp() {
    if (!this.#injHelper) return;
    this.#injHelper.hideApp();
  }

  /**
   * Hides the app container.
   * */
  hideApp() {
    this.handleHideApp();
  }
}

;// ./Scripts/Injection/inject.js


// 🚀 Start the app

let routeHelper;

(async () => {
  try {
    await waitForBody(); // wait for body to exist
    await onPageReady(); // wait for DOM ready

    await new Promise((r) => setTimeout(r, 500));
    InjectUtils.injectStylesheet();

    // Now safe to start monitoring routes
    routeHelper = new RouteHelper();
    InjectUtils.injectToggleButton(routeHelper);
    routeHelper.monitorRouteChanges();
  } catch (err) {
    console.error("❌ Failed to initialize TrenchersPaperTrading:", err);
  }
})();

function waitForBody() {
  return new Promise((resolve) => {
    if (document.body) return resolve();
    const observer = new MutationObserver((mutations, obs) => {
      if (document.body) {
        obs.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function onPageReady() {
  return new Promise((resolve) => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      return resolve();
    }
    window.addEventListener("DOMContentLoaded", resolve, { once: true });
  });
}

window.addEventListener("message", async (event) => {
  // Security: Accept messages from extension iframes and same origin
  const isExtensionOrigin = event.origin.startsWith("chrome-extension://");
  const isSameOrigin = event.origin === window.location.origin;

  if (!isExtensionOrigin && !isSameOrigin) {
    return;
  }

  const { type, requestId } = event.data;

  if (type === "CONTRACT_REQUEST" && requestId) {
    const contract = RouteHelper.getURLSegmentAfter("meme");
    event.source.postMessage(
      {
        type: "CONTRACT_RESPONSE",
        contract,
        requestId,
      },
      event.origin,
    );
  }
  if (type === "SHOW_NOTIFICATION" && event.data?.message) {
    InjectUtils.showNotification(event.data.message);
  }

  if (type === "HIDE_APP") {
    routeHelper?.handleHideApp();
  }
});

/******/ })()
;