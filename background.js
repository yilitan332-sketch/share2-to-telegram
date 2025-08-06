const SHARE_URL_PATTERN = "https://telegram.me/share/*";

// Utility function to find the share tab or create it if it doesn't exist.
async function findOrCreateShareTab(url) {
  const tabs = await browser.tabs.query({ url: SHARE_URL_PATTERN });

  if (tabs.length > 0) {
    console.log(`Found existing share tab with ID: ${tabs[0].id}. Reusing it.`);
    const updatedTab = await browser.tabs.update(tabs[0].id, { url: url });
    return updatedTab;
  } else {
    console.log("No share tab found. Creating a new one.");
    const newTab = await browser.tabs.create({ url: url });
    return newTab;
  }
}

// Handles the share process when the user is already authorized.
// Opens or updates the share tab in the background.
async function handleAuthorizedShare(shareUrl) {
  console.log("Handling share as an 'Authorized' user.");
  await findOrCreateShareTab(shareUrl);
  console.log("Share tab updated in the background.");
  // Focus remains on the current tab.
}

// Handles the share process for a first-time user.
// Opens the share tab and brings it to the front.
async function handleUnauthorizedShare(shareUrl) {
  console.log("Handling share as a 'Not Authorized' user.");
  const shareTab = await findOrCreateShareTab(shareUrl);

  // Bring the tab to the front for the user to interact with.
  await browser.tabs.update(shareTab.id, { active: true });
  console.log(`Share tab ${shareTab.id} brought to front for one-time authorization.`);

  // Listen for when the user manually closes this tab to mark them as authorized.
  const onRemovedListener = (tabId) => {
    if (tabId === shareTab.id) {
      console.log(`Share tab ${tabId} was manually closed. Setting user as authorized.`);
      browser.storage.local.set({ isAuthorized: true });
      // Clean up this specific listener
      browser.tabs.onRemoved.removeListener(onRemovedListener);
    }
  };
  browser.tabs.onRemoved.addListener(onRemovedListener);
}

// Main function that runs when the user clicks the browser action icon.
async function onClicked(currentTab) {
  console.log("Share icon clicked.");
  const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(currentTab.url)}`;

  try {
    const result = await browser.storage.local.get("isAuthorized");
    if (result.isAuthorized) {
      await handleAuthorizedShare(shareUrl);
    } else {
      await handleUnauthorizedShare(shareUrl);
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

browser.action.onClicked.addListener(onClicked);
