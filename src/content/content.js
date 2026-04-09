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

// Helper to wrap callback-based chrome storage in Promises
const storage = {
  sync: {
    get: (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve)),
    set: (data) => new Promise(resolve => chrome.storage.sync.set(data, resolve))
  },
  local: {
    get: (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
    set: (data) => new Promise(resolve => chrome.storage.local.set(data, resolve))
  }
};

async function startRoast() {
  if (isRoasting) return;
  isRoasting = true;

  try {
    const settings = await storage.sync.get(['roastParagraphs', 'colorizeRoastedText', 'enableCaching']);
    const roastParas = settings.roastParagraphs ?? true;
    const colorize = settings.colorizeRoastedText ?? true;
    const enableCaching = settings.enableCaching ?? true;

    const selector = roastParas ? 'title, p, h1, h2, h3, h4, h5, h6' : 'title, h1, h2, h3, h4, h5, h6';
    const elements = Array.from(document.querySelectorAll(selector));

    const validElements = elements.filter(el => {
      const text = (el.innerText || el.textContent)?.trim();
      return text && text.length > 10 && !el.dataset.roasted;
    });

    if (validElements.length === 0) {
      isRoasting = false;
      return;
    }

    const currentUrl = window.location.href.split('#')[0];
    let pageCache = {};

    if (enableCaching) {
      console.log("Funny Bone: Checking cache for:", currentUrl);
      const cacheData = await storage.local.get('funnyBoneCache');
      const fullCache = cacheData.funnyBoneCache || {};
      
      if (fullCache[currentUrl]) {
        const entry = fullCache[currentUrl];
        if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
          pageCache = entry.roasts || {};
          console.log("Funny Bone: Valid cache found with", Object.keys(pageCache).length, "items.");
          
          validElements.forEach(el => {
            const originalHtml = el.innerHTML.trim();
            if (pageCache[originalHtml]) {
              el.innerHTML = pageCache[originalHtml];
              el.dataset.roasted = "true";
              if (colorize) el.style.color = '#e52e71';
            }
          });
        }
      }
    }

    const remainingElements = validElements.filter(el => !el.dataset.roasted);
    if (remainingElements.length === 0) {
      console.log("Funny Bone: All elements restored from cache.");
      isRoasting = false;
      return;
    }

    console.log(`Funny Bone: ${remainingElements.length} elements need roasting.`);
    const CHUNK_SIZE = roastParas ? 5 : 10;

    for (let i = 0; i < remainingElements.length; i += CHUNK_SIZE) {
      const targetElements = remainingElements.slice(i, i + CHUNK_SIZE);
      const texts = targetElements.map(el => el.innerHTML.trim());

      targetElements.forEach(el => {
        if (colorize) {
          el.style.transition = 'opacity 0.3s';
          el.style.opacity = '0.5';
        }
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
            const originalHtml = texts[index];
            const roastedHtml = roasted[index];
            
            pageCache[originalHtml] = roastedHtml;

            el.style.opacity = '0';
            setTimeout(() => {
              el.innerHTML = roastedHtml;
              el.dataset.roasted = "true";
              el.style.opacity = '1';
              if (colorize) el.style.color = '#e52e71';
            }, 300);
          } else {
            el.style.opacity = '1';
          }
        });

        // Save progress to cache after every successful batch
        if (enableCaching) {
          const cacheData = await storage.local.get('funnyBoneCache');
          const fullCache = cacheData.funnyBoneCache || {};
          fullCache[currentUrl] = { timestamp: Date.now(), roasts: pageCache };
          
          // Keep only 50 most recent
          const urls = Object.keys(fullCache);
          if (urls.length > 50) {
            const oldest = urls.sort((a, b) => fullCache[a].timestamp - fullCache[b].timestamp)[0];
            delete fullCache[oldest];
          }
          await storage.local.set({ funnyBoneCache: fullCache });
          console.log("Funny Bone: Cache updated per-batch.");
        }
      } else {
        console.error("Funny Bone AI Error:", response?.error);
        targetElements.forEach(el => el.style.opacity = '1');
      }
    }
  } catch (err) {
    console.error("Funny Bone Extension Error:", err);
    alert("Funny Bone Extension Error: " + err.message);
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
    const settings = await chrome.storage.sync.get(['colorizeRoastedText']);
    const colorize = settings.colorizeRoastedText ?? true;

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
      if (colorize) {
        span.style.color = '#e52e71';
      }
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
