// Function to update the status text on the options page
function updateStatus() {
  browser.storage.local.get("isAuthorized").then((result) => {
    const statusElement = document.getElementById("status");
    const authSection = document.getElementById("authorize-section");

    if (result.isAuthorized) {
      statusElement.textContent = "Authorized. The extension is ready.";
      statusElement.style.color = "#2A8A2A"; // Green
      // Hide the initial authorization section if already authorized
      authSection.style.display = "none";
    } else {
      statusElement.textContent = "Not Authorized. Please complete the one-time setup below.";
      statusElement.style.color = "#D94848"; // Red
      authSection.style.display = "block";
    }
  });
}

// Function to handle the Authorize button click
async function authorize() {
  console.log("Authorization button clicked.");

  // Get the currently active tab to share a real URL instead of a dummy one.
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  // Use the current tab's URL, or a sensible fallback if no active tab is found.
  const urlToShare = (tabs[0] && tabs[0].url) ? tabs[0].url : "https://telegram.org/";
  console.log(`Using URL for authorization: ${urlToShare}`);

  // Set the flag in storage first
  await browser.storage.local.set({ isAuthorized: true });
  console.log("Authorization status set to true.");

  // Open the Telegram share link for the first time for the user to approve OS-level prompts
  const authShareLink = `https://telegram.me/share/url?url=${encodeURIComponent(urlToShare)}`;
  await browser.tabs.create({ url: authShareLink, active: true });

  // Update the status on the options page
  updateStatus();
}

// Function to handle the Reset button click
function resetAuthorization() {
  browser.storage.local.set({ isAuthorized: false }).then(() => {
    console.log("Authorization has been reset.");
    updateStatus();
  });
}

// Run these functions when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateStatus();
  document.getElementById("authorize-btn").addEventListener("click", authorize);
  document.getElementById("reset-auth").addEventListener("click", resetAuthorization);
});
