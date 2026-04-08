document.addEventListener('DOMContentLoaded', () => {
  const globalToggle = document.getElementById('globalToggle');
  const paragraphToggle = document.getElementById('paragraphToggle');
  const roastBtn = document.getElementById('roastBtn');

  // Load the current state
  chrome.storage.sync.get(['isAutoRoastEnabled', 'roastParagraphs'], (result) => {
    const isEnabled = result.isAutoRoastEnabled ?? false;
    const roastParas = result.roastParagraphs ?? true;
    
    globalToggle.checked = isEnabled;
    paragraphToggle.checked = roastParas;
    updateButtonState(isEnabled);
  });

  // Handle toggle changes
  globalToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ isAutoRoastEnabled: isEnabled });
    updateButtonState(isEnabled);
    
    // Notify the active tab if we just turned it on
    if (isEnabled) {
      triggerRoast({ auto: true });
    }
  });

  paragraphToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ roastParagraphs: e.target.checked });
  });

  // Handle settings button click
  document.getElementById('settingsBtn').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('src/options/options.html'));
    }
  });

  // Handle roast button click
  roastBtn.addEventListener('click', () => {
    triggerRoast({ auto: false });
  });

  function updateButtonState(isEnabled) {
    if (isEnabled) {
      roastBtn.disabled = true;
      roastBtn.textContent = 'Auto-Roasting Active';
    } else {
      roastBtn.disabled = false;
      roastBtn.textContent = 'Roast Current Page';
    }
  }

  function triggerRoast(options) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerRoast', ...options });
      }
    });
  }
});
