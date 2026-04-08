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
  
  // Target paragraphs and headers
  const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
  
  // Filter for elements that actually have text and haven't been roasted
  const validElements = elements.filter(el => {
    const text = el.innerText?.trim();
    return text && text.length > 10 && !el.dataset.roasted;
  });

  if (validElements.length === 0) {
    isRoasting = false;
    return;
  }

  // To avoid massive payloads, let's batch them or just take the first ~50 elements
  const MAX_ELEMENTS = 40;
  const targetElements = validElements.slice(0, MAX_ELEMENTS);
  
  const texts = targetElements.map(el => el.innerText.trim());

  // Show a loading state on elements
  targetElements.forEach(el => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0.5';
  });

  try {
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
      console.error("Funny Bone Error:", response?.error);
      targetElements.forEach(el => el.style.opacity = '1');
    }
  } catch (err) {
    console.error("Funny Bone Extension Error:", err);
    targetElements.forEach(el => el.style.opacity = '1');
  } finally {
    isRoasting = false;
  }
}
