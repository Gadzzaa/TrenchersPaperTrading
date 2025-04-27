chrome.runtime.onInstalled.addListener(() => {
  console.log('Background service worker initialized');
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "createNotification") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "Images/test.png", // Ensure you have an icon.png
      title: "Account Created",
      message: `Your account has been created successfully. Username: ${request.username}, Password: ${request.password}`,
      priority: 2
    });
  }
});
