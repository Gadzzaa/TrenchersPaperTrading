// Core state
let appInjected = false;
let lastPathname = location.pathname;
let contractObserver = null;
let lastFullPath = location.pathname;
let lastContract = null;

// 🚀 Start the app
monitorRouteChanges();
getSolPrice();
setInterval(getSolPrice, 60 * 60 * 500);

window.addEventListener("message", async (event) => {
  const { type, requestId } = event.data;

  if (type === "CONTRACT_REQUEST" && requestId) {
    const contract = extractContractFromImage();
    event.source.postMessage(
      {
        type: "CONTRACT_RESPONSE",
        contract,
        requestId,
      },
      "*",
    );
  }
  if (type === "PRICE_REQUEST" && requestId) {
    const price = await getPrice();
    event.source.postMessage(
      {
        type: "PRICE_RESPONSE",
        price,
        requestId,
      },
      "*",
    );
  }
  if (type === "SYMBOL_REQUEST" && requestId) {
    const symbol = extractSymbol();
    event.source.postMessage(
      {
        type: "SYMBOL_RESPONSE",
        symbol,
        requestId,
      },
      "*",
    );
  }
  if (type === "SHOW_NOTIFICATION" && event.data?.message) {
    showNotification(event.data.message);
  }
});

function extractContractFromImage() {
  const links = document.querySelectorAll('a[href*="x.com/search?q="]');

  for (const link of links) {
    const target = link.getAttribute("target");
    const rel = link.getAttribute("rel");

    const hasCorrectTarget = target === "_blank";
    const hasCorrectRel =
      rel?.split(" ").includes("noopener") &&
      rel?.split(" ").includes("noreferrer");

    if (!hasCorrectTarget || !hasCorrectRel) continue; // skip if attributes are missing

    try {
      const url = new URL(link.href);
      const contract = url.searchParams.get("q");

      // Validate it's a real contract-looking string
      if (contract && /^[A-Za-z0-9]{32,}$/.test(contract)) {
        return contract;
      }
    } catch (error) {
      console.error("❌ Error parsing contract from link:", error);
    }
  }

  return null;
}

function extractSymbol() {
  const xpath =
    "/html/body/div[1]/div[3]/div/div/div/div/div[1]/div[1]/div/div[1]/div[2]/div/div/div/div[1]/div[2]/div[1]/span[1]";
  const symbolElement = getElementByXPath(xpath);
  if (!symbolElement) return null;
  try {
    const symbol = symbolElement.innerText;
    if (symbol && symbol.length > 0) {
      return symbol.trim();
    }
  } catch (error) {
    console.error("❌ Error parsing symbol from element:", error);
  }
}

function getElementByXPath(xpath, context = document) {
  const result = document.evaluate(
    xpath,
    context,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );
  return result.singleNodeValue;
}

function makeDraggable(target, handle, iframe) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  const dragOverlay = document.createElement("div");
  Object.assign(dragOverlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "9999999",
    cursor: "grabbing",
    display: "none",
  });
  document.body.appendChild(dragOverlay);

  const startDrag = (e) => {
    isDragging = true;
    offsetX = e.clientX - target.getBoundingClientRect().left;
    offsetY = e.clientY - target.getBoundingClientRect().top;
    document.body.style.userSelect = "none";

    target.style.transition = "opacity 0.15s ease";
    target.style.opacity = "0.8";
    target.style.transform = "scale(0.98)";

    dragOverlay.style.display = "block";
    if (iframe) iframe.style.pointerEvents = "none";
  };

  const onDrag = (e) => {
    if (!isDragging) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetRect = target.getBoundingClientRect();

    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    // Clamp within bounds
    const clampedLeft = Math.min(
      Math.max(0, newLeft),
      viewportWidth - targetRect.width,
    );
    const clampedTop = Math.min(
      Math.max(0, newTop),
      viewportHeight - targetRect.height,
    );

    target.style.left = `${clampedLeft}px`;
    target.style.top = `${clampedTop}px`;
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;

    document.body.style.userSelect = "";
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
    handle.style.width = "12px";
    handle.style.height = "8px";
    handle.style.left = "174.5px";
    handle.style.top = "6px";

    dragOverlay.style.display = "none";
    if (iframe) iframe.style.pointerEvents = "auto";

    // Save position
    localStorage.setItem("draggableLeft", target.style.left);
    localStorage.setItem("draggableTop", target.style.top);
  };
  const resetPosition = () => {
    target.style.left = "100px";
    target.style.top = "100px";
    localStorage.setItem("draggableLeft", "100px");
    localStorage.setItem("draggableTop", "100px");
  };
  handle.addEventListener("dblclick", resetPosition);
  handle.addEventListener("pointerdown", startDrag);

  dragOverlay.addEventListener("pointermove", onDrag, { passive: true });
  dragOverlay.addEventListener("pointerup", endDrag);
}

function handleRouteChange() {
  const currentPath = location.pathname;
  const isOnMemePage = currentPath.startsWith("/meme");
  lastFullPath = currentPath;

  if (isOnMemePage) {
    if (!appInjected) {
      injectApp();
      appInjected = true;
    }
  } else {
    if (appInjected) {
      removeApp();
      appInjected = false;
    }
  }
}

function removeApp() {
  const appContainer = document.getElementById("TrenchersPaperTrading");
  if (appContainer) {
    appContainer.remove();
  }
}

function injectApp() {
  const isWithinBounds = (left, top, width, height) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return (
      parseInt(left) + width <= vw &&
      parseInt(top) + height <= vh &&
      parseInt(left) >= 0 &&
      parseInt(top) >= 0
    );
  };

  const appContainer = document.createElement("div");
  appContainer.id = "TrenchersPaperTrading";
  Object.assign(appContainer.style, {
    position: "fixed",
    top: "100px",
    left: "100px",
    width: "350px",
    height: "285px",
    zIndex: "99999",
    background: "transparent",
    borderRadius: "12px",
    overflow: "hidden",
    userSelect: "none",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  const savedLeft = localStorage.getItem("draggableLeft");
  const savedTop = localStorage.getItem("draggableTop");

  if (
    savedLeft &&
    savedTop &&
    isWithinBounds(savedLeft, savedTop, 350, 240) // your app size
  ) {
    appContainer.style.left = savedLeft;
    appContainer.style.top = savedTop;
  }

  const appIframe = document.createElement("iframe");
  appIframe.src = chrome.runtime.getURL("dashboard.html");
  Object.assign(appIframe.style, {
    width: "100%",
    height: "240px",
    border: "none",
    borderRadius: "12px",
    zIndex: "2",
  });

  appContainer.appendChild(appIframe);
  document.body.appendChild(appContainer);

  const style = document.createElement("style");
  style.textContent = `

  #TrenchersPaperTrading {
    --background: #1e1e2e;
    --footerbg: #181825;
    --green: #a6e3a1;
    --red: #f38ba8;
    --text: #cdd6f4;
    --active: #89b4fa;
    --surface: #45475a;
  }


  .notification {
    position: absolute;
    will-change: transform, opacity;
    transform: translateY(-100%);
    top: 240px;
    width: 350px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: var(--background, #222);
    color: var(--text, #fff);
    padding: 16px 32px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    font-family: "Poppins", sans-serif;
    font-size: 0.75rem;
    text-align: center;
    z-index: -1;
    transition:
      transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s;
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
  `;
  document.head.appendChild(style);

  const notification = document.createElement("div");
  notification.id = "notification";
  notification.className = "notification";

  // Create span for text
  const notifText = document.createElement("span");
  notifText.id = "notifText";
  notification.appendChild(notifText);

  appContainer.appendChild(notification);

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

  appContainer.appendChild(moveHandle);
  makeDraggable(appContainer, moveHandle, appIframe);

  setTimeout(() => {
    appContainer.style.opacity = "1";
  }, 50);
}

function showNotification(message) {
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

function monitorRouteChanges() {
  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("popstate", () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  handleRouteChange();
}

/**
 * Parses a compact number string like "27.9K", "1B", "123M" into a Number.
 */
function parseCompactNumber(txt) {
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
  const mult = unit === "K" ? 1e3 : unit === "M" ? 1e6 : unit === "B" ? 1e9 : 1;

  return num * mult;
}

/**
 * Finds the on-page "Supply" label, reads the next span's text,
 * and returns the circulating supply as a Number.
 */
function getSupply() {
  return 1000000000; // TODO: Fix this
  /*
  // 1. Grab all spans that style numeric values
  const els = document.querySelectorAll('span.text-textPrimary');
  // 2. Regex: digits (with optional decimals) ending in K, M, or B
  const re = /^(\d+(?:\.\d+)?)([KMB])$/;

  for (const el of els) {
    const txt = el.textContent.trim();
    const m = txt.match(re);
    if (m) {
      // parseCompactNumber is your helper from before
      const supply = parseCompactNumber(txt);
      console.log('Parsed supply:', supply);
      return supply;
    }
  }
  */

  throw new Error("Supply element not found");
}

function getMarketCapFromTitle() {
  const title = document.title.trim();
  // e.g. "MyTokenName → $8.71K | Price: 0.00003 SOL"

  // 1) Split on arrow
  const arrowParts = title.split("$");
  if (arrowParts.length < 2) {
    throw new Error("Title missing arrow separator");
  }

  // 2) Take right side and split on pipe
  const rightSide = arrowParts[1].trim(); // "$8.71K | Price:…"
  const pipeParts = rightSide.split("|");
  if (pipeParts.length < 1) {
    throw new Error("Title missing pipe separator");
  }

  // 3) The first segment is the market cap string
  const rawCap = pipeParts[0].trim(); // "$8.71K"

  // 4) Parse it
  const capNumber = parseCompactNumber(rawCap);
  return capNumber;
}
function fetchWithTimeout(url, options = {}, ms = 5000) {
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error("Request timed out")), ms),
  );
  return Promise.race([fetch(url, options), timeout]);
}

async function getPrice() {
  try {
    const tokenSupply = getSupply();
    const marketCapUsd = getMarketCapFromTitle();
    const solUsdPrice = localStorage.getItem("solUsdPrice");
    const tokenPriceUsd = marketCapUsd / tokenSupply;

    return (tokenPriceUsd / solUsdPrice).toFixed(9);
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}
async function getSolPrice() {
  const resp = await fetchWithTimeout(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    {},
    5000,
  );
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const { solana } = await resp.json();
  const solUsdPrice = solana.usd;
  localStorage.setItem("solUsdPrice", solUsdPrice);
}
