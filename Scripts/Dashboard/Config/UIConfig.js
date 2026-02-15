import { UIManager } from "../../Utils/Core/UIManager.js";
export class UIConfig {
  static settings = [
    {
      key: "theme",
      default: "dark",
      apply: (value) => {
        document.documentElement.setAttribute("data-theme", value);
      },
    },
    {
      key: "animation",
      default: 3,
      apply: (value) => {
        document.documentElement.style.setProperty(
          "--anim-time",
          `${value / 10}s`,
        );
      },
    },
  ];

  static createStorageMessageListener(stateManager) {
    return (changes, area) => {
      if (area === "local" && changes.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          changes.theme.newValue,
        );
      }
      if (area === "local" && changes.animation) {
        document.documentElement.style.setProperty(
          "--anim-time",
          `${changes.animation.newValue / 10}s`,
        );
      }
      if (area === "local" && changes.pnlSlider) {
        //changeDelay(changes.updateDelay.newValue);
        // TODO: fix this, somehow changeDelay function is nonexistent
      }
    };
  }

  static createRuntimeMessageListener(stateManager) {
    return (message, sender, sendResponse) => {
      if (message.type === "initDashboard") {
        console.log("User registered, initializing dashboard...");
        stateManager.initialize();
      }

      if (message.type === "logoutDashboard") {
        console.log("User logged out, disabling dashboard...");
        stateManager.logout();
      }

      if (message.type === "STATUS_UPDATE") {
        console.log("Health status update received:", message.status);

        if (!message.status) {
          stateManager.disconnect();
          UIManager.disableUI("no-internet");
        } else {
          stateManager.initialize();
        }
      }
    };
  }
}
