// Content script - runs on LinkedIn job pages

// Extract job information from the current LinkedIn page
function extractJobInfo() {
  let jobTitle = '';
  let companyName = '';
  let jobDescription = '';

  // Try multiple selectors for job title (LinkedIn changes these)
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.t-24.job-details-jobs-unified-top-card__job-title',
    'h1.t-24',
    '.job-details-jobs-unified-top-card__job-title h1',
    'h1[class*="job-title"]',
    '.jobs-details__main-content h1'
  ];

  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      jobTitle = el.textContent.trim();
      break;
    }
  }

  // Try multiple selectors for company name
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__primary-description-container a',
    '.jobs-details__main-content a[data-tracking-control-name*="company"]',
    'a[class*="company-name"]',
    '.job-details-jobs-unified-top-card__primary-description a'
  ];

  for (const selector of companySelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      companyName = el.textContent.trim();
      break;
    }
  }

  // Try multiple selectors for job description
  const descriptionSelectors = [
    '.jobs-description__content',
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '#job-details',
    '.job-details-jobs-unified-top-card__job-insight',
    '[class*="description"]',
    '.jobs-description'
  ];

  for (const selector of descriptionSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim().length > 100) {
      jobDescription = el.textContent.trim();
      break;
    }
  }

  // Clean up the description
  jobDescription = jobDescription
    .replace(/\s+/g, ' ')
    .replace(/Show more|Show less/gi, '')
    .trim();

  return {
    jobTitle,
    companyName,
    jobDescription,
    url: window.location.href
  };
}

// Add floating button to LinkedIn job pages
function addTailorButton() {
  // Remove existing button if any
  const existing = document.getElementById('resume-tailor-btn');
  if (existing) existing.remove();

  // Create floating button
  const button = document.createElement('button');
  button.id = 'resume-tailor-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    <span>Tailor Resume</span>
  `;
  button.title = 'Tailor your resume for this job';

  button.addEventListener('click', () => {
    const jobInfo = extractJobInfo();
    chrome.runtime.sendMessage({
      action: 'openPopupWithJob',
      jobInfo: jobInfo
    });

    // Store job info for popup to access
    chrome.storage.local.set({ currentJobInfo: jobInfo });

    // Show notification
    showNotification('Job info captured! Click the extension icon to tailor your resume.');
  });

  document.body.appendChild(button);
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'resume-tailor-notification';
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add('fade-out');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobInfo') {
    const jobInfo = extractJobInfo();
    sendResponse(jobInfo);
  }
  return true;
});

// Initialize when page loads
function init() {
  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTailorButton);
  } else {
    addTailorButton();
  }

  // Re-add button when navigating within LinkedIn (SPA)
  const observer = new MutationObserver((mutations) => {
    if (!document.getElementById('resume-tailor-btn')) {
      addTailorButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

init();
