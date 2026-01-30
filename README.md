# LinkedIn Resume Tailor

A Chrome extension that uses Claude AI to automatically tailor your resume for LinkedIn job applications.

## Features

- **Auto-extract job details** from LinkedIn job postings
- **AI-powered resume tailoring** using Claude (Anthropic API)
- **One-click customization** for each job application
- **Copy or download** tailored resumes instantly
- **Your data stays local** - API key stored in browser only

## Installation

### 1. Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to Settings > API Keys
4. Create a new API key (starts with `sk-ant-`)
5. Copy the key (you'll need it in step 4)

### 2. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `linkedin-resume-tailor` folder
5. The extension icon should appear in your toolbar

### 3. Generate Icons (First Time Setup)

The extension needs PNG icons. You can:

**Option A: Use an online converter**
1. Go to [svgtopng.com](https://svgtopng.com)
2. Upload `icons/icon.svg`
3. Download as 16x16, 48x48, and 128x128 PNG
4. Save as `icon16.png`, `icon48.png`, `icon128.png` in the `icons` folder

**Option B: Use the placeholder icons**
Create simple colored square PNGs as placeholders.

### 4. Configure the Extension

1. Click the extension icon in Chrome toolbar
2. Click the settings gear icon
3. Paste your Anthropic API key
4. Click "Save API Key"

## Usage

1. **Go to LinkedIn** and find a job you want to apply for
2. **Open the job posting** (click on it to see full details)
3. **Click "Tailor Resume"** button (appears bottom-right of page)
   - Or click the extension icon in toolbar
4. **Review extracted job info** - edit if needed
5. **Click "Generate Tailored Resume"**
6. **Wait for Claude** to customize your resume (10-20 seconds)
7. **Copy or download** the result

## Files Structure

```
linkedin-resume-tailor/
├── manifest.json          # Extension manifest
├── background/
│   └── background.js      # API calls to Claude
├── content/
│   ├── content.js         # LinkedIn page interaction
│   └── content.css        # Floating button styles
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
└── icons/
    ├── icon.svg           # Source icon
    ├── icon16.png         # 16x16 icon
    ├── icon48.png         # 48x48 icon
    └── icon128.png        # 128x128 icon
```

## Customization

### Update Your Base Resume

1. Open extension settings
2. Scroll to "Base Resume" section
3. Edit or paste your updated resume
4. Click "Save Resume"

### Change AI Model

1. Open extension settings
2. Under "AI Model", select:
   - **Claude Sonnet 4** - Best balance of quality and speed (recommended)
   - **Claude 3.5 Haiku** - Faster and cheaper
   - **Claude Opus 4** - Most capable, best quality

## Troubleshooting

**"Could not extract job info"**
- Make sure you're on a LinkedIn job posting page
- Scroll down to load the full job description
- Refresh the page and try again

**"API key not valid"**
- Check that your API key starts with `sk-ant-`
- Make sure you have credits in your Anthropic account
- Generate a new API key if needed

**Extension not appearing**
- Go to `chrome://extensions/`
- Make sure the extension is enabled
- Click the puzzle icon in Chrome toolbar to pin it

## Privacy

- Your API key is stored locally in Chrome
- Resume data is only sent to Anthropic's API
- No data is collected or stored by the extension
- Job descriptions are processed in real-time and not saved

## Cost

Using Claude API has usage-based pricing:
- Claude Sonnet 4: ~$0.003 per resume tailoring
- Claude Haiku: ~$0.001 per resume tailoring
- Claude Opus 4: ~$0.015 per resume tailoring

At these rates, you can tailor hundreds of resumes for a few dollars.

## License

MIT - Use freely for your job search!
