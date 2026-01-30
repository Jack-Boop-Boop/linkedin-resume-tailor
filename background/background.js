// Background service worker for API calls

const BASE_RESUME = `Jack Bergin
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

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tailorResume') {
    tailorResume(request.jobDescription, request.companyName, request.jobTitle)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getBaseResume') {
    sendResponse({ resume: BASE_RESUME });
    return true;
  }
});

async function tailorResume(jobDescription, companyName, jobTitle) {
  // Get API key from storage
  const { anthropicApiKey } = await chrome.storage.sync.get('anthropicApiKey');

  if (!anthropicApiKey) {
    throw new Error('Please set your Anthropic API key in the extension settings');
  }

  const prompt = `You are a professional resume writer. I need you to tailor my resume for a specific job application.

## My Base Resume:
${BASE_RESUME}

## Job I'm Applying For:
Company: ${companyName}
Position: ${jobTitle}

## Job Description:
${jobDescription}

## Instructions:
1. Customize the Professional Summary to specifically mention the company name and role type
2. Reorder and emphasize skills that match the job requirements
3. Adjust bullet points in experience sections to highlight relevant accomplishments
4. Add any relevant keywords from the job description naturally
5. Keep the same overall structure and sections
6. Do NOT fabricate experience or skills I don't have
7. Keep it to 1 page (be concise)

## Output Format:
Return ONLY the tailored resume text, formatted cleanly. Do not include any explanation or commentary - just the resume content ready to copy/paste.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.content[0].text;
}
