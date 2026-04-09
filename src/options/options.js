document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelNameInput = document.getElementById('modelName');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  // Load existing settings
  chrome.storage.sync.get(['openaiApiKey', 'openaiModel'], (result) => {
    if (result.openaiApiKey) apiKeyInput.value = result.openaiApiKey;
    if (result.openaiModel) modelNameInput.value = result.openaiModel;
    else modelNameInput.value = 'gpt-4.1-nano'; // Default model
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelNameInput.value.trim() || 'gpt-4.1-nano';

    chrome.storage.sync.set({
      openaiApiKey: apiKey,
      openaiModel: modelName
    }, () => {
      // Show saved status
      statusMessage.classList.remove('hidden');
      setTimeout(() => {
        statusMessage.classList.add('hidden');
      }, 2000);
    });
  });
});
