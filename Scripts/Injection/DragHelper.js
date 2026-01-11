export class DragHelper {
  /**
   * @param {HTMLDivElement} target - Container to be made draggable
   * @param {HTMLDivElement} handle - Element that initiates the drag
   * @param {HTMLIframeElement} iframe - Element to disable pointer events on during drag
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
      helper.handle.style.width = "12px";
      helper.handle.style.height = "8px";
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
