let isRoasting = false;

// Listen for manual trigger from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerRoast' && !isRoasting) {
    startRoast();
  }
});

// Auto-run check on load
chrome.storage.sync.get(['isAutoRoastEnabled'], (result) => {
  if (result.isAutoRoastEnabled && !isRoasting) {
    // Slight delay to let the page settle
    setTimeout(startRoast, 1000);
  }
});

async function startRoast() {
  isRoasting = true;
  
  // Target title, paragraphs and headers
  const elements = Array.from(document.querySelectorAll('title, p, h1, h2, h3, h4, h5, h6'));
  
  // Filter for elements that actually have text and haven't been roasted
  const validElements = elements.filter(el => {
    const text = el.innerText?.trim();
    return text && text.length > 10 && !el.dataset.roasted;
  });

  if (validElements.length === 0) {
    isRoasting = false;
    return;
  }

  // Process in batches of 40 to avoid massive payloads
  const CHUNK_SIZE = 40;
  
  // Show a loading state on all elements immediately
  validElements.forEach(el => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0.5';
  });

  try {
    for (let i = 0; i < validElements.length; i += CHUNK_SIZE) {
      const targetElements = validElements.slice(i, i + CHUNK_SIZE);
      const texts = targetElements.map(el => el.innerText.trim());

      const response = await chrome.runtime.sendMessage({
        action: 'roastTextNodes',
        texts: texts
      });

      if (response && response.success && response.roastedTexts) {
        const roasted = response.roastedTexts;
        targetElements.forEach((el, index) => {
          if (roasted[index]) {
            // Replace text with a nice fade effect
            el.style.opacity = '0';
            setTimeout(() => {
              el.innerText = roasted[index];
              el.dataset.roasted = "true";
              el.style.opacity = '1';
              el.style.color = '#e52e71'; // Give it a slight brand color tint to indicate it was roasted
            }, 300);
          } else {
            el.style.opacity = '1';
          }
        });
      } else {
        console.error("Funny Bone Error on batch:", response?.error);
        if (i === 0) {
          // Only alert on the first failure to avoid alert spam
          alert("Funny Bone AI Error:\n\n" + (response?.error || "Unknown error occurred."));
        }
        targetElements.forEach(el => el.style.opacity = '1');
      }
    }
  } catch (err) {
    console.error("Funny Bone Extension Error:", err);
    alert("Funny Bone Extension Error:\n\n" + err.message);
    validElements.forEach(el => el.style.opacity = '1');
  } finally {
    isRoasting = false;
  }
}
