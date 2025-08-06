// Function to update the status text on the options page
function updateStatus() {
  browser.storage.local.get("isAuthorized", (result) => {
    const statusElement = document.getElementById("status");
    if (result.isAuthorized) {
      statusElement.textContent = "Authorized. Shares will be handled in the background.";
      statusElement.style.color = "#2A8A2A"; // Green
    } else {
      statusElement.textContent = "Not Authorized. The share tab will be brought to the front for a one-time setup.";
      statusElement.style.color = "#D94848"; // Red
    }
  });
}

// Function to handle the reset button click
function resetAuthorization() {
  browser.storage.local.set({ isAuthorized: false }, () => {
    console.log("Authorization has been reset.");
    updateStatus();
  });
}

// Run these functions when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateStatus();
  document.getElementById("reset-auth").addEventListener("click", resetAuthorization);
});
