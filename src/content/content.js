let isRoasting = false;

// Listen for manual trigger from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerRoast' && !isRoasting) {
    startRoast();
  } else if (request.action === 'triggerRoastSelection' && !isRoasting) {
    startRoastSelection();
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

  const result = await chrome.storage.sync.get(['roastParagraphs']);
  const roastParas = result.roastParagraphs ?? true;

  // Target title and headers. Conditionally include paragraphs based on settings.
  const selector = roastParas ? 'title, p, h1, h2, h3, h4, h5, h6' : 'title, h1, h2, h3, h4, h5, h6';
  const elements = Array.from(document.querySelectorAll(selector));

  // Filter for elements that actually have text and haven't been roasted
  const validElements = elements.filter(el => {
    const text = el.innerText?.trim();
    return text && text.length > 10 && !el.dataset.roasted;
  });

  if (validElements.length === 0) {
    isRoasting = false;
    return;
  }

  // Process in batches to avoid massive payloads
  const CHUNK_SIZE = 5;

  try {
    for (let i = 0; i < validElements.length; i += CHUNK_SIZE) {
      const targetElements = validElements.slice(i, i + CHUNK_SIZE);
      const texts = targetElements.map(el => el.innerHTML.trim());

      // Show a loading state on the elements actively being processed in this chunk
      targetElements.forEach(el => {
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0.5';
      });

      const response = await chrome.runtime.sendMessage({
        action: 'roastTextNodes',
        pageTitle: document.title,
        texts: texts
      });

      if (response && response.success && response.roastedTexts) {
        const roasted = response.roastedTexts;
        targetElements.forEach((el, index) => {
          if (roasted[index]) {
            // Replace text with a nice fade effect
            el.style.opacity = '0';
            setTimeout(() => {
              el.innerHTML = roasted[index];
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

async function startRoastSelection() {
  const selection = window.getSelection();

  if (selection.isCollapsed || isRoasting) return;

  // Capture HTML instead of just text
  const div = document.createElement('div');
  const originalRange = selection.getRangeAt(0).cloneRange();
  div.appendChild(originalRange.cloneContents());
  const textHtml = div.innerHTML.trim();

  if (!textHtml) return;

  isRoasting = true;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'roastTextNodes',
      pageTitle: document.title,
      texts: [textHtml]
    });

    if (response && response.success && response.roastedTexts && response.roastedTexts.length > 0) {
      const roastedText = response.roastedTexts[0];

      // Replace the selected text in the DOM using our cached range
      originalRange.deleteContents();

      const span = document.createElement('span');
      span.innerHTML = roastedText;
      span.style.color = '#e52e71';
      span.dataset.roasted = "true";
      span.style.transition = 'opacity 0.3s';
      span.style.opacity = '0';

      originalRange.insertNode(span);

      // Fade it in to match aesthetics
      setTimeout(() => {
        span.style.opacity = '1';
      }, 50);

      selection.removeAllRanges();
    } else {
      console.error("Funny Bone Error on selection:", response?.error);
      alert("Funny Bone AI Error:\n\n" + (response?.error || "Unknown error occurred."));
    }
  } catch (err) {
    console.error("Funny Bone Extension Error:", err);
    alert("Funny Bone Extension Error:\n\n" + err.message);
  } finally {
    isRoasting = false;
  }
}
