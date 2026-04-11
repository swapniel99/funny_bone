document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelNameInput = document.getElementById('modelName');
  const colorizeToggle = document.getElementById('colorizeToggle');
  const cacheToggle = document.getElementById('cacheToggle');
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  // Load existing settings
  chrome.storage.sync.get(['openaiApiKey', 'openaiModel', 'colorizeRoastedText', 'enableCaching'], (result) => {
    if (result.openaiApiKey) apiKeyInput.value = result.openaiApiKey;
    if (result.openaiModel) modelNameInput.value = result.openaiModel;
    else modelNameInput.value = 'gpt-5.4-nano'; // Default model

    colorizeToggle.checked = result.colorizeRoastedText ?? false;
    cacheToggle.checked = result.enableCaching ?? true;
  });

  // Handle Clear Cache
  clearCacheBtn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      const originalText = clearCacheBtn.textContent;
      clearCacheBtn.textContent = 'Cache Cleared!';
      setTimeout(() => {
        clearCacheBtn.textContent = originalText;
      }, 2000);
    });
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelNameInput.value.trim() || 'gpt-5.4-nano';
    const colorize = colorizeToggle.checked;
    const enableCaching = cacheToggle.checked;

    chrome.storage.sync.set({
      openaiApiKey: apiKey,
      openaiModel: modelName,
      colorizeRoastedText: colorize,
      enableCaching: enableCaching
    }, () => {
      // Show saved status
      statusMessage.classList.remove('hidden');
      setTimeout(() => {
        statusMessage.classList.add('hidden');
      }, 2000);
    });
  });
});
