chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "roastSelection",
    title: "Roast Selected Text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "roastSelection") {
    chrome.tabs.sendMessage(tab.id, {
      action: 'triggerRoastSelection'
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'roastTextNodes') {
    handleRoasting(request.texts, request.pageTitle)
      .then(roastedTexts => sendResponse({ success: true, roastedTexts }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

async function handleRoasting(texts, pageTitle) {
  const result = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
  const apiKey = result.openaiApiKey;
  const model = result.openaiModel || 'gpt-4.1-nano';

  if (!apiKey) {
    throw new Error('API Key is missing. Please configure it in the extension settings.');
  }

  const prompt = `You are a witty, sarcastic, and roasting AI. The user will provide a JSON array of text strings from a webpage titled: "${pageTitle || 'Unknown Website'}".
Rewrite each string to make it subtly funny, sarcastic, and roasting based on the context of this overarching title. Keep the length and core meaning somewhat similar if possible, but make it entertaining.
CRITICAL RULES:
1. You MUST rewrite the text in the exact SAME LANGUAGE it was provided in.
2. The provided strings contain HTML tags (like <a>, <b>, <span>, etc.). You MUST perfectly preserve all HTML tags, including their exact attributes, wrapped around the appropriate parts of your rewritten text.
3. Return a valid JSON object with exactly one key named "roastedTexts", whose value is the array of your rewritten strings in the exact same order. Do not return anything else.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: "json_object" },
      max_tokens: 8000,
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
    const parsedObject = JSON.parse(content);
    const resultArr = parsedObject.roastedTexts;

    if (!Array.isArray(resultArr)) {
      throw new Error('AI response was not a JSON array.');
    }

    // If the AI somehow returned fewer or more items, we'll just log a warning
    // and use what we can instead of breaking the entire rendering process.
    if (resultArr.length !== texts.length) {
      console.warn(`Mismatch in array size. Sent: ${texts.length}, Received: ${resultArr.length}`);
    }

    return resultArr;
  } catch (err) {
    console.error("Raw AI Output:", content);
    throw new Error('Failed to parse AI output: ' + err.message);
  }
}
