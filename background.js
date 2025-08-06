async function onClicked(currentTab) {
  console.log("[Share to Telegram] Action clicked. Starting process.");

  // Encode the URL to handle special characters
  const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(currentTab.url)}`;
  console.log(`[Share to Telegram] Generated share URL: ${shareUrl}`);

  try {
    console.log("[Share to Telegram] Creating the sharing tab...");
    const shareTab = await browser.tabs.create({
      url: shareUrl,
      active: true,
    });
    console.log(`[Share to Telegram] Share tab created with ID: ${shareTab.id}`);

    // This listener will wait for the sharing tab to load, then close it.
    const onUpdateListener = (tabId, changeInfo) => {
      if (tabId === shareTab.id && changeInfo.status === 'complete') {
        console.log(`[Share to Telegram] Share tab ID ${tabId} has finished loading.`);
        // Use a short timeout to ensure the browser has time to launch the Telegram app
        setTimeout(() => {
          console.log(`[Share to Telegram] Closing share tab ${shareTab.id} and focusing original tab ${currentTab.id}.`);
          // Close the sharing tab and focus the original tab.
          // Add error catching in case the user has already closed one of the tabs.
          browser.tabs.remove(shareTab.id).catch(e => console.error(`[Share to Telegram] Error removing tab: ${e}`));
          browser.tabs.update(currentTab.id, { active: true }).catch(e => console.error(`[Share to Telegram] Error updating tab: ${e}`));
        }, 500);

        // Clean up the listener to prevent memory leaks
        console.log("[Share to Telegram] Removing tab update listener.");
        browser.tabs.onUpdated.removeListener(onUpdateListener);
      }
    };

    browser.tabs.onUpdated.addListener(onUpdateListener);
    console.log("[Share to Telegram] Tab update listener added.");

  } catch (error) {
    console.error(`[Share to Telegram] A critical error occurred: ${error}`);
  }
}

// Register the listener for the browser action click.
// For Manifest V3, this is `browser.action`.
browser.action.onClicked.addListener(onClicked);
