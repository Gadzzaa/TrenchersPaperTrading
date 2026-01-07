import { InjectHelper } from "./InjectHelper.js";

export class RouteHelper {
  #lastPathname = "";
  #injHelper = null;

  getAppContainer() {
    return this.#injHelper?.getAppContainer();
  }

  static getURLSegmentAfter(baseSegment) {
    const parts = new URL(window.location.href).pathname
      .split("/")
      .filter(Boolean);
    const idx = parts.indexOf(baseSegment);
    return idx >= 0 && parts.length > idx + 1
      ? decodeURIComponent(parts[idx + 1])
      : null;
  }

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

  handleHideApp() {
    if (!this.#injHelper) return;
    this.#injHelper.hideApp();
  }

  hideApp() {
    this.handleHideApp();
  }
}
