async function onClicked(currentTab) {
  // Encode the URL to handle special characters
  const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(currentTab.url)}`;

  try {
    // Create the Telegram sharing tab
    const shareTab = await browser.tabs.create({
      url: shareUrl,
      active: true,
    });

    // This listener will wait for the sharing tab to load, then close it.
    const onUpdateListener = (tabId, changeInfo) => {
      if (tabId === shareTab.id && changeInfo.status === 'complete') {
        // Use a short timeout to ensure the browser has time to launch the Telegram app
        setTimeout(() => {
          // Close the sharing tab and focus the original tab.
          // Add error catching in case the user has already closed one of the tabs.
          browser.tabs.remove(shareTab.id).catch(e => console.log(e));
          browser.tabs.update(currentTab.id, { active: true }).catch(e => console.log(e));
        }, 500);

        // Clean up the listener to prevent memory leaks
        browser.tabs.onUpdated.removeListener(onUpdateListener);
      }
    };

    browser.tabs.onUpdated.addListener(onUpdateListener);

  } catch (error) {
    console.error(`Error sharing to Telegram: ${error}`);
  }
}

// Register the listener for the browser action click.
// For Manifest V3, this is `browser.action`.
browser.action.onClicked.addListener(onClicked);
