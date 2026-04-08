chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'roastTextNodes') {
    handleRoasting(request.texts)
      .then(roastedTexts => sendResponse({ success: true, roastedTexts }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // Return true to indicate we will send a response asynchronously
    return true; 
  }
});

async function handleRoasting(texts) {
  const result = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
  const apiKey = result.openaiApiKey;
  const model = result.openaiModel || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('API Key is missing. Please configure it in the extension settings.');
  }

  const prompt = `You are a witty, sarcastic, and roasting AI. The user will provide a JSON array of text strings from a webpage. 
Rewrite each string to make it subtly funny, sarcastic, and roasting. Keep the length and core meaning somewhat similar if possible, but make it entertaining. 
IMPORTANT: Return ONLY a valid JSON array of strings in the exact same order. Do not wrap it in markdown block quotes.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify(texts) }
      ],
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to fetch from OpenAI');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    // Attempt to parse the response as JSON (could be wrapped in ```json)
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const resultArr = JSON.parse(cleanedContent);
    if (!Array.isArray(resultArr) || resultArr.length !== texts.length) {
       throw new Error('Invalid output format from AI.');
    }
    return resultArr;
  } catch (err) {
    throw new Error('Failed to parse the roasted text array from OpenAI output.');
  }
}
