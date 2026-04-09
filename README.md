# Funny Bone AI 🦴🔥

Funny Bone is a sleek, dark-themed Chrome Extension that uses OpenAI to rewrite webpage content in a subtle, sarcastic, and roasting tone. It intelligently preserves hyperlinks and original language while injecting a healthy dose of wit into your browsing experience.

## ✨ Features

- **Global Toggle**: Turn the "Auto-Roast" mode on/off from the extension menu.
- **Selective Roasting**: Use the "Roast Paragraphs" toggle to focus only on headers and titles, or include full paragraphs for maximum chaos.
- **Persistent Caching**: Remembers roasted content for the last **50 unique pages** you've visited. Re-visiting a page results in a near-instant transformation without additional API costs.
- **Context-Aware Roasting**: The AI considers the page title to ensure the sarcasm is contextual and sharp.
- **Hyperlink Preservation**: Roast your content without breaking your navigation. All `<a>`, `<b>`, and other HTML tags are preserved.
- **Subtle Mode**: Optionally disable text colorization. When "Colorize Roasted Text" is off, the extension swaps text invisibly without any visual loading indicators or color changes.
- **Native Context Menu**: Highlight any text on a page, right-click, and select "Roast Selected Text" to roast on demand.
- **Multilingual Support**: Rewrites text in the original language (Gujarati, French, Hindi, etc.).
- **Robust Execution**: Utilizes OpenAI's latest JSON Mode for error-free parsing of complex HTML content.

## 🛠 Installation

Since this is a developer version, you'll need to install it as an unpacked extension:

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click the **Load unpacked** button.
5. Select the `funny_bone` project folder.
6. Click the extension icon in your toolbar and pin **Funny Bone**.

## ⚙️ Configuration

1. Click the **Funny Bone** extension icon.
2. Click the **Settings (⚙️)** icon in the top right of the popup.
3. Enter your **OpenAI API Key**.
4. (Optional) Specify your preferred model (e.g., `gpt-4.1-nano`).
5. Toggle **Enable Caching** to save/restore roasts across sessions.
6. Toggle **Colorize Roasted Text** to choose between brand-colored (Pink) or native-colored text.
7. Click **Save Settings**.
8. Use **Clear Local Cache** to wipe all stored roasts and free up storage.

## 🚀 Usage

- **Auto-Roast**: Simply enable the "Auto-Roast" toggle in the menu, and see pages transform as they load.
- **On-Demand**: Keep the toggle off and click **"Roast Current Page"** whenever you want to spice things up.
- **Selective**: Highlight any text on a page, right-click, and select **"Roast Selected Text"**.

## 📦 Project Structure

```text
funny_bone/
├── manifest.json         # Extension configuration
├── src/
│   ├── background/
│   │   └── background.js # API parsing and Context Menu handling
│   ├── content/
│   │   └── content.js    # Caching, DOM manipulation, and text extraction
│   ├── popup/
│   │   ├── popup.html    # Extension menu
│   │   ├── popup.js      # Menu logic
│   │   └── popup.css     # Menu styling
│   └── options/
│       ├── options.html  # API and Cache configuration
│       ├── options.js    # Sync and Cache persistence logic
│       └── options.css   # Settings page styling
└── assets/               # Extension icons
```

## ⚠️ Requirements

- An active OpenAI API key.
- A modern version of Google Chrome.

---
*Warning: May result in a significant increase in browsing-induced laughter and/or mild personal offense.*
