import { DragHelper } from "./DragHelper.js";
import { InjectUtils } from "./InjectUtils.js";

export class InjectHelper {
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
      width: "12px",
      height: "8px",
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

    chrome.storage.local.get("saveWindowPos", ({ saveWindowPos }) => {
      if (!saveWindowPos) return;
      if (
        savedLeft &&
        savedTop &&
        InjectUtils.isWithinBounds(savedLeft, savedTop, 350, 240) // your app size
      ) {
        this.#appContainer.style.left = savedLeft;
        this.#appContainer.style.top = savedTop;
      }
    });
  }
  loadSettings() {
    chrome.storage.local.get("animation", ({ animation }) => {
      if (!animation) animation = 3;
      document.documentElement.style.setProperty(
        "--anim-time",
        `${animation / 10}s`,
      );
    });

    chrome.storage.local.get("theme", ({ theme }) => {
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
