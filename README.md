# Funny Bone AI 🦴🔥

Funny Bone is a sleek, dark-themed Chrome Extension that uses OpenAI to rewrite webpage content in a subtle, sarcastic, and roasting tone. It intelligently preserves hyperlinks and original language while injecting a healthy dose of wit into your browsing experience.

## ✨ Features

- **Global Toggle**: Turn the "Auto-Roast" mode on/off from the extension menu.
- **Selective Roasting**: Use the "Roast Paragraphs" toggle to focus only on headers and titles, or include full paragraphs for maximum chaos.
- **Context-Aware Roasting**: The AI considers the page title to ensure the sarcasm is contextual and sharp.
- **Hyperlink Preservation**: Roast your content without breaking your navigation. All `<a>`, `<b>`, and other HTML tags are preserved.
- **Native Context Menu**: Highlight any text on a page, right-click, and select "Roast Selected Text" to roast on demand.
- **Multilingual Support**: Rewrites text in the original language (Gujarati, French, Hindi, etc.).
- **Smart Chunking**: Processes large pages in optimized batches (5 paragraphs or 10 headers) to ensure speed and stability.
- **JSON Mode**: Utilizes OpenAI's latest JSON format for robust, error-free parsing.

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
5. Click **Save Settings**.

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
│   │   └── background.js # Proxy logic, Context Menus, and API handling
│   ├── content/
│   │   └── content.js    # DOM manipulation and text extraction
│   ├── popup/
│   │   ├── popup.html    # Main extension menu
│   │   ├── popup.js      # Menu logic and state management
│   │   └── popup.css     # Sleek dark-mode styling
│   └── options/
│       ├── options.html  # API configuration page
│       ├── options.js    # Settings persistence logic
│       └── options.css   # Settings page styling
└── assets/               # Extension icons
```

## ⚠️ Requirements

- An active OpenAI API key.
- A modern version of Google Chrome.

---
*Warning: May result in a significant increase in browsing-induced laughter and/or mild personal offense.*
