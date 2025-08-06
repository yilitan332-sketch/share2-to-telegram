const SHARE_URL_PATTERN = "https://telegram.me/share/*";

// This function finds an old share tab, closes it, and creates a new one.
// This ensures a fresh page load every time, which is required.
async function findCloseAndCreate(url) {
  // Find any existing share tabs
  const oldTabs = await browser.tabs.query({ url: SHARE_URL_PATTERN });

  for (const tab of oldTabs) {
    console.log(`Found and closing old share tab with ID: ${tab.id}`);
    await browser.tabs.remove(tab.id);
  }

  // Create a new tab. It will be created in the background by default
  // unless `active: true` is specified.
  console.log("Creating a new share tab in the background.");
  await browser.tabs.create({
    url: url,
    active: false // Explicitly create it in the background
  });
}

// Main function that runs when the user clicks the browser action icon.
async function onClicked(currentTab) {
  console.log("Share icon clicked.");

  try {
    const result = await browser.storage.local.get("isAuthorized");

    if (result.isAuthorized) {
      // --- Authorized Workflow ---
      console.log("User is authorized. Proceeding with sharing.");
      const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(currentTab.url)}`;
      await findCloseAndCreate(shareUrl);
    } else {
      // --- Unauthorized Workflow ---
      console.log("User is not authorized. Opening options page for one-time setup.");
      // This is the standard, recommended way to open an extension's options page.
      browser.runtime.openOptionsPage();
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

browser.action.onClicked.addListener(onClicked);
