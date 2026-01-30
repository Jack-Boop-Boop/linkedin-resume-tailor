// Options page script

const DEFAULT_RESUME = `Jack Bergin
Portland, ME
jack.bergin@maine.edu | 603-303-7193
LinkedIn | GitHub

Professional Summary
Computer Science student at the University of Southern Maine with hands-on research and data engineering experience in AI and information retrieval. Experienced in Python-based data scraping, data cleaning, LaTeX/MathJax transformation, and analytical system development. Seeking a [ROLE_TYPE] with [COMPANY_NAME] to apply data processing, analytics, and problem-solving skills to real-world [INDUSTRY] challenges.

Education
University of Southern Maine
B.S. Computer Science | Expected Graduation: 2027 | GPA: 3.29
Certification: Responsive Web Design (FreeCodeCamp)

Technical Skills
Programming: Python, Java, C++, WebDev, OOP, Data Structures & Algorithms
Tools: GitHub, Eclipse, Microsoft Excel, PowerPoint, Word, JetBrains, VisualCode
Data & Analytics: Data scraping, data cleaning, algorithmic analysis, basic statistical reasoning, visualization concepts

Professional & Research Experience

AIIR Lab Researcher
USM Artificial Intelligence and Information Retrieval Laboratory
Portland, Maine | Mar 2025 – Jun 2025
• Built Python pipelines to scrape, clean, and standardize mathematical theorems and proofs from ProofWiki
• Transformed complex LaTeX and MathJax formulas into structured, machine-readable formats
• Performed data cleaning, normalization, and schema standardization for large unstructured datasets
• Supported research in AI, information retrieval, and data structuring

Fry Cook
Sebago Brewing Company – Gorham, ME | Nov 2023 – Present
• Operated in high-pressure, high-volume environment requiring precision, speed, and accuracy
• Developed strong workflow optimization, task prioritization, and reliability under pressure

Mover
Bridge Bros. Moving | May 2024 – Aug 2024
• Worked in the labor force and helped with unique problem solving
• Strengthened adaptability and critical thinking in dynamic environments

Leadership

Co-President – Computer Science Society
University of Southern Maine | Sep 2024 – May 2025
• Lead programs introducing computer science concepts to beginners and majors
• Organize workshops and collaborative learning events to strengthen technical community

Projects

MySearchEngine (Java)
Built a search engine using TreeMap and Okapi BM25 for efficient text retrieval and scoring

Stock Market Prediction System (Python)
• Built a data-driven prediction system using historical stock market data to generate trend-based forecasts from user-provided ticker symbols
• Performed data cleaning, normalization, and feature extraction
• Applied statistical analysis and predictive modeling concepts to identify market patterns
• Designed system to return structured outputs for analysis and visualization

Binary Search Tree for Song Data
Implemented BST for multi-genre dataset management, sorting, and retrieval

Core Competencies
Data engineering - Data analysis - Critical thinking - Problem solving - Collaboration - Communication - Reliability - Adaptability - Confidentiality - Awareness`;

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const apiKeyInput = document.getElementById('apiKey');
  const toggleKeyBtn = document.getElementById('toggleKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const saveStatus = document.getElementById('saveStatus');
  const modelSelect = document.getElementById('model');
  const saveModelBtn = document.getElementById('saveModel');
  const baseResumeInput = document.getElementById('baseResume');
  const saveResumeBtn = document.getElementById('saveResume');
  const resetResumeBtn = document.getElementById('resetResume');

  // Load saved settings
  const settings = await chrome.storage.sync.get([
    'anthropicApiKey',
    'claudeModel',
    'baseResume'
  ]);

  if (settings.anthropicApiKey) {
    apiKeyInput.value = settings.anthropicApiKey;
  }

  if (settings.claudeModel) {
    modelSelect.value = settings.claudeModel;
  }

  baseResumeInput.value = settings.baseResume || DEFAULT_RESUME;

  // Toggle API key visibility
  let keyVisible = false;
  toggleKeyBtn.addEventListener('click', () => {
    keyVisible = !keyVisible;
    apiKeyInput.type = keyVisible ? 'text' : 'password';
  });

  // Save API key
  saveKeyBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('error', 'Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      showStatus('error', 'Invalid API key format. Should start with sk-ant-');
      return;
    }

    await chrome.storage.sync.set({ anthropicApiKey: apiKey });
    showStatus('success', 'API key saved successfully!');
  });

  // Save model preference
  saveModelBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({ claudeModel: modelSelect.value });
    showStatus('success', 'Model preference saved!');
  });

  // Save base resume
  saveResumeBtn.addEventListener('click', async () => {
    const resume = baseResumeInput.value.trim();
    if (!resume) {
      showStatus('error', 'Resume cannot be empty');
      return;
    }
    await chrome.storage.sync.set({ baseResume: resume });
    showStatus('success', 'Resume saved!');
  });

  // Reset resume to default
  resetResumeBtn.addEventListener('click', async () => {
    baseResumeInput.value = DEFAULT_RESUME;
    await chrome.storage.sync.set({ baseResume: DEFAULT_RESUME });
    showStatus('success', 'Resume reset to default!');
  });

  // Helper function
  function showStatus(type, message) {
    saveStatus.textContent = message;
    saveStatus.className = `status ${type}`;
    saveStatus.classList.remove('hidden');

    setTimeout(() => {
      saveStatus.classList.add('hidden');
    }, 3000);
  }
});
