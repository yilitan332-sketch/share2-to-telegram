const SHARE_URL_PATTERN = "https://telegram.me/share/*";

// YouTube-style approach: Use iframe or direct window.location instead of tabs
async function triggerTelegramShare(url) {
  console.log("Triggering Telegram share with URL:", url);

  try {
    // First, try to find if there's an active tab to inject the script
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (activeTab && activeTab.url && (activeTab.url.startsWith('http://') || activeTab.url.startsWith('https://'))) {
      // Only inject into regular web pages, not extension pages or special URLs
      await browser.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: function(shareUrl) {
          try {
            // Create a hidden iframe to trigger the protocol handler
            // This prevents a new tab from opening while still triggering the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.src = shareUrl;
            document.body.appendChild(iframe);

            // Remove the iframe after a short delay
            setTimeout(() => {
              try {
                if (iframe.parentNode) {
                  document.body.removeChild(iframe);
                }
              } catch (e) {
                console.log('Iframe already removed or error removing:', e);
              }
            }, 1000);
          } catch (e) {
            console.error('Error creating iframe:', e);
          }
        },
        args: [url]
      });
      console.log("Successfully triggered share via iframe");
      return; // Success, no need for fallback
    } else {
      console.log("No suitable active tab for iframe injection, using fallback");
    }
  } catch (error) {
    console.log("Error with iframe approach, falling back to tab method:", error.message);
  }

  // Fallback to the original tab method if injection fails
  await fallbackTabMethod(url);
}

// Fallback method - improved version of the original approach
async function fallbackTabMethod(url) {
  // Find any existing share tabs
  const oldTabs = await browser.tabs.query({ url: SHARE_URL_PATTERN });

  for (const tab of oldTabs) {
    console.log(`Found and closing old share tab with ID: ${tab.id}`);
    await browser.tabs.remove(tab.id);
  }

  // Wait for tabs to be fully removed
  await new Promise(resolve => setTimeout(resolve, 200));

  // Create the tab in the foreground briefly to ensure protocol handler triggers
  console.log("Creating new share tab in foreground to trigger protocol.");
  const newTab = await browser.tabs.create({
    url: url,
    active: true // Create in foreground initially
  });

  // Quickly switch back to the original tab
  setTimeout(async () => {
    try {
      // Get all tabs and find the one we came from (excluding the share tab)
      const allTabs = await browser.tabs.query({ currentWindow: true });
      const originalTab = allTabs.find(tab =>
        tab.id !== newTab.id &&
        !tab.url.includes('telegram.me/share') &&
        (tab.url.startsWith('http://') || tab.url.startsWith('https://'))
      );

      if (originalTab) {
        await browser.tabs.update(originalTab.id, { active: true });
        console.log("Switched back to original tab");
      } else {
        console.log("No suitable original tab found to switch back to");
      }

      // Close the share tab after protocol is triggered
      setTimeout(async () => {
        try {
          await browser.tabs.remove(newTab.id);
          console.log("Share tab closed");
        } catch (e) {
          console.log("Share tab already closed or couldn't be closed:", e);
        }
      }, 1000);

    } catch (error) {
      console.error("Error switching back to original tab:", error);
    }
  }, 300);
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
      await triggerTelegramShare(shareUrl);
    } else {
      // --- Unauthorized Workflow ---
      console.log("User is not authorized. Opening options page for one-time setup.");
      browser.runtime.openOptionsPage();
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

browser.action.onClicked.addListener(onClicked);
