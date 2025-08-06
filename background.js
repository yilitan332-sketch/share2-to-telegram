async function onClicked(currentTab) {
  console.log("[Share to Telegram] Action clicked. Opening sharing page in a new tab.");

  // Encode the URL to handle special characters
  const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(currentTab.url)}`;
  console.log(`[Share to Telegram] Generated share URL: ${shareUrl}`);

  try {
    // Create the Telegram sharing tab and leave it open for manual interaction.
    await browser.tabs.create({
      url: shareUrl,
      active: true,
    });
    console.log("[Share to Telegram] Share tab created successfully. It will remain open.");

  } catch (error) {
    console.error(`[Share to Telegram] A critical error occurred while creating the tab: ${error}`);
  }
}

// Register the listener for the browser action click.
// For Manifest V3, this is `browser.action`.
browser.action.onClicked.addListener(onClicked);
