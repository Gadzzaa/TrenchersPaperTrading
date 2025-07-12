// Tooltip Manager
class TooltipManager {
  constructor() {
    this.tooltip = document.getElementById("tooltip");
    this.timeout = null;
    this.currentTarget = null;
    this.init();
  }

  init() {
    // Add event listeners to all elements with data-tooltip
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (target && target !== this.currentTarget) {
        this.showTooltip(target, e);
      }
    });

    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (target) {
        // Use a small delay to handle rapid hover changes
        setTimeout(() => {
          // Only hide if we're not hovering any tooltip element
          const hoveredElement = document.querySelector("[data-tooltip]:hover");
          if (!hoveredElement) {
            this.hideTooltip();
          }
        }, 50);
      }
    });

    // Hide tooltip when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-tooltip]")) {
        this.hideTooltip();
      }
    });

    // Hide tooltip on scroll
    document.addEventListener("scroll", () => {
      this.hideTooltip();
    });

    // Hide tooltip on window resize
    window.addEventListener("resize", () => {
      this.hideTooltip();
    });
  }

  showTooltip(target, event) {
    const tooltipText = target.getAttribute("data-tooltip");
    if (!tooltipText) return;

    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Hide immediately if switching targets
    if (this.currentTarget && this.currentTarget !== target) {
      this.tooltip.classList.remove("show");
      this.currentTarget = null;
    }

    // Already shown for same target? Do nothing
    if (
      this.tooltip.classList.contains("show") &&
      this.currentTarget === target
    ) {
      return;
    }

    this.currentTarget = target;

    // Show tooltip after delay
    this.timeout = setTimeout(() => {
      if (this.currentTarget === target) {
        this.tooltip.textContent = tooltipText; // ✅ move here
        this.positionTooltip(target, event);
        this.tooltip.classList.add("show");
      }
    }, 1500);
  }

  hideTooltip() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.tooltip.classList.remove("show");
    this.currentTarget = null;
  }

  positionTooltip(target, event) {
    const container = document.getElementById("Container");
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Get tooltip dimensions
    const tooltipWidth = 100;
    const tooltipHeight = 24;

    // Calculate position relative to the target element
    const targetCenterX =
      targetRect.left - containerRect.left + targetRect.width / 2;
    const targetTop = targetRect.top - containerRect.top;
    const targetBottom = targetRect.bottom - containerRect.top;

    // Position tooltip above the element by default
    let x = targetCenterX - tooltipWidth / 2;
    let y = targetTop - tooltipHeight - 8;

    if (y < 0) y = targetBottom + 8;

    if (x < 0) x = 2;

    if (x + tooltipWidth > containerRect.width)
      x = containerRect.width - tooltipWidth - 2;

    if (y + tooltipHeight > containerRect.height)
      y = containerRect.height - tooltipHeight - 2;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  // Method to show tooltip programmatically
  showCustomTooltip(text, x, y, position = "top") {
    this.tooltip.textContent = text;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;

    this.tooltip.classList.remove("top", "bottom", "left", "right");
    this.tooltip.classList.add(position, "show");
  }

  // Method to hide tooltip programmatically
  hideCustomTooltip() {
    this.tooltip.classList.remove("show");
  }
}

// Initialize tooltip manager when DOM is loaded
let tooltipManager;
document.addEventListener("DOMContentLoaded", () => {
  tooltipManager = new TooltipManager();
});

// Export for use in other modules
export { TooltipManager };
