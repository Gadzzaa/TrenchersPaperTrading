// TODO: Remake
export class UIManager {
  async enableUI() {
    const blocker = document.getElementById("Blocker");
    const popup = document.getElementById("popupTrenchersPT");
    if (blocker) {
      blocker.style.opacity = "0";
      setTimeout(() => {
        const noInternetMessage = document.getElementById("noInternetMessage");
        const noSessionMessage = document.getElementById("noSessionMessage");
        const updateReqMessage = document.getElementById("updateReqMessage");
        if (noInternetMessage) noInternetMessage.style.display = "none";
        if (noSessionMessage) noSessionMessage.style.display = "none";
        if (updateReqMessage) updateReqMessage.style.display = "none";

        blocker.style.display = "none";
      }, 300);
    }
    if (popup) {
      const loginPanel = document.getElementById("loginPanel");
      const noInternet = document.getElementById("noInternet");
      const updateReq = document.getElementById("updateReq");
      if (!noInternet?.classList.contains("hidden")) {
        noInternet.style.opacity = "0";
        setTimeout(() => {
          noInternet.classList.add("hidden");
        }, 300);
      }
      if (!updateReq?.classList.contains("hidden")) {
        updateReq.style.opacity = "0";
        setTimeout(() => {
          updateReq.classList.add("hidden");
        }, 300);
      }
      if (loginPanel) loginPanel.classList.add("loginHidden");
    }
  }

  async disableUI(reason) {
    const blocker = document.getElementById("Blocker");
    const popup = document.getElementById("popupTrenchersPT");
    if (blocker) {
      blocker.style.display = "flex";
      const noInternetMessage = document.getElementById("noInternetMessage");
      const noSessionMessage = document.getElementById("noSessionMessage");
      const updateReqMessage = document.getElementById("updateReqMessage");
      noInternetMessage.style.display = "none";
      noSessionMessage.style.display = "none";
      updateReqMessage.style.display = "none";
      switch (reason) {
        case "no-internet":
          if (noInternetMessage) noInternetMessage.style.display = "flex";
          break;
        case "no-session":
          if (noSessionMessage) noSessionMessage.style.display = "flex";
          break;
        case "outdated":
          if (updateReqMessage) updateReqMessage.style.display = "flex";
          break;
      }
      setTimeout(() => {
        blocker.style.opacity = "1";
      }, 300);
    }
    if (popup) {
      const loginPanel = document.getElementById("loginPanel");
      const noInternet = document.getElementById("noInternet");
      const updateReq = document.getElementById("updateReq");
      switch (reason) {
        case "no-internet":
          if (!updateReq?.classList.contains("hidden")) {
            updateReq.style.opacity = "0";
            setTimeout(() => {
              updateReq.classList.add("hidden");
            }, 300);
          }

          if (noInternet?.classList.contains("hidden")) {
            noInternet.style.opacity = "0";
            noInternet.classList.remove("hidden");
            noInternet.style.opacity = "1";
          }
          break;
        case "no-session":
          if (!noInternet?.classList.contains("hidden")) {
            noInternet.style.opacity = "0";
            setTimeout(() => {
              noInternet.classList.add("hidden");
            }, 300);
          }
          if (!updateReq?.classList.contains("hidden")) {
            updateReq.style.opacity = "0";
            setTimeout(() => {
              updateReq.classList.add("hidden");
            }, 300);
          }
          if (loginPanel) loginPanel.classList.remove("loginHidden");
          break;
        case "outdated":
          if (!noInternet?.classList.contains("hidden")) {
            noInternet.style.opacity = "0";
            setTimeout(() => {
              noInternet.classList.add("hidden");
            }, 300);
          }

          if (updateReq?.classList.contains("hidden")) {
            updateReq.style.opacity = "0";
            updateReq.classList.remove("hidden");
            updateReq.style.opacity = "1";
          }
          break;
      }
    }
  }
}
