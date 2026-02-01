// Popup script with auto-save, match score, and ATS checking
// FREE features: Match Score, ATS Checker, Auto-save
// API Required: AI Resume Generation

// Skills from the base resume
const RESUME_SKILLS = [
  'python', 'java', 'c++', 'javascript', 'webdev', 'web development',
  'oop', 'object oriented', 'data structures', 'algorithms',
  'github', 'git', 'eclipse', 'excel', 'powerpoint', 'word',
  'jetbrains', 'visual studio', 'vscode',
  'data scraping', 'data cleaning', 'data analysis', 'data engineering',
  'machine learning', 'ml', 'ai', 'artificial intelligence',
  'information retrieval', 'latex', 'mathjax',
  'statistical analysis', 'statistics', 'visualization',
  'sql', 'database', 'api', 'rest',
  'problem solving', 'critical thinking', 'collaboration', 'communication',
  'leadership', 'teamwork', 'agile', 'project management'
];

// Common tech skills to detect in job descriptions
const COMMON_SKILLS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby',
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'data analysis', 'data science', 'pandas', 'numpy', 'r',
  'tableau', 'power bi', 'excel', 'visualization',
  'api', 'rest', 'graphql', 'microservices',
  'agile', 'scrum', 'jira', 'confluence',
  'communication', 'leadership', 'problem solving', 'teamwork', 'collaboration'
];

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const clearBtn = document.getElementById('clearBtn');
  const savedIndicator = document.getElementById('savedIndicator');
  const companyInput = document.getElementById('companyName');
  const jobTitleInput = document.getElementById('jobTitle');
  const jobDescInput = document.getElementById('jobDescription');
  const generateBtn = document.getElementById('generateBtn');
  const loading = document.getElementById('loading');
  const resultsSection = document.getElementById('resultsSection');
  const resumeOutput = document.getElementById('resumeOutput');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const errorMessage = document.getElementById('errorMessage');

  // Match score elements
  const matchSection = document.getElementById('matchSection');
  const matchRing = document.getElementById('matchRing');
  const matchPercent = document.getElementById('matchPercent');
  const matchStatus = document.getElementById('matchStatus');
  const matchingSkillsEl = document.getElementById('matchingSkills');
  const missingSkillsEl = document.getElementById('missingSkills');
  const refreshMatchBtn = document.getElementById('refreshMatch');

  // ATS elements
  const atsIcon = document.getElementById('atsIcon');
  const atsStatus = document.getElementById('atsStatus');
  const atsScore = document.getElementById('atsScore');

  // API status elements
  const apiKeyStatus = document.getElementById('apiKeyStatus');
  const apiStatusIcon = document.getElementById('apiStatusIcon');
  const apiStatusLabel = document.getElementById('apiStatusLabel');
  const openSettings = document.getElementById('openSettings');

  // Check for API key and update status
  let hasApiKey = false;
  const { anthropicApiKey } = await chrome.storage.sync.get('anthropicApiKey');

  if (anthropicApiKey) {
    hasApiKey = true;
    apiKeyStatus.classList.add('configured');
    apiStatusIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`;
    apiStatusLabel.textContent = 'API key configured';
    openSettings.textContent = 'Change settings';
    generateBtn.disabled = false;
  } else {
    generateBtn.disabled = true;
  }

  // Load saved form data
  const savedData = await chrome.storage.local.get(['draftCompany', 'draftTitle', 'draftDescription', 'draftResults']);

  if (savedData.draftCompany || savedData.draftTitle || savedData.draftDescription) {
    companyInput.value = savedData.draftCompany || '';
    jobTitleInput.value = savedData.draftTitle || '';
    jobDescInput.value = savedData.draftDescription || '';
    savedIndicator.classList.remove('hidden');

    // Hide indicator after 3 seconds
    setTimeout(() => savedIndicator.classList.add('hidden'), 3000);

    // Show match score if description exists
    if (savedData.draftDescription) {
      updateMatchScore(savedData.draftDescription);
    }
  }

  // Restore results if available
  if (savedData.draftResults) {
    resumeOutput.textContent = savedData.draftResults;
    resultsSection.classList.remove('hidden');
    checkATSScore(savedData.draftResults);
  }

  // Auto-save on input changes (debounced)
  let saveTimeout;
  const autoSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormData, 500);
  };

  companyInput.addEventListener('input', autoSave);
  jobTitleInput.addEventListener('input', autoSave);
  jobDescInput.addEventListener('input', () => {
    autoSave();
    // Update match score when description changes
    clearTimeout(window.matchTimeout);
    window.matchTimeout = setTimeout(() => {
      updateMatchScore(jobDescInput.value);
    }, 800);
  });

  function saveFormData() {
    chrome.storage.local.set({
      draftCompany: companyInput.value,
      draftTitle: jobTitleInput.value,
      draftDescription: jobDescInput.value
    });
  }

  // Clear saved data
  clearBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['draftCompany', 'draftTitle', 'draftDescription', 'draftResults']);
    companyInput.value = '';
    jobTitleInput.value = '';
    jobDescInput.value = '';
    resultsSection.classList.add('hidden');
    matchSection.classList.add('hidden');
    savedIndicator.classList.add('hidden');
  });

  // Open settings
  openSettings?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Refresh match score
  refreshMatchBtn.addEventListener('click', () => {
    updateMatchScore(jobDescInput.value);
  });

  // Match score calculation (FREE)
  function updateMatchScore(jobDescription) {
    if (!jobDescription || jobDescription.length < 50) {
      matchSection.classList.add('hidden');
      return;
    }

    matchSection.classList.remove('hidden');
    const description = jobDescription.toLowerCase();

    // Find skills mentioned in job description
    const jobSkills = [];
    COMMON_SKILLS.forEach(skill => {
      if (description.includes(skill.toLowerCase())) {
        jobSkills.push(skill);
      }
    });

    // Find matching skills (skills I have that job wants)
    const matchingSkills = [];
    const missingSkills = [];

    jobSkills.forEach(skill => {
      const hasSkill = RESUME_SKILLS.some(resumeSkill =>
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(resumeSkill.toLowerCase())
      );

      if (hasSkill) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Calculate match percentage
    const totalJobSkills = jobSkills.length || 1;
    const matchPercValue = Math.round((matchingSkills.length / totalJobSkills) * 100);

    // Update UI
    matchPercent.textContent = matchPercValue;

    // Update ring progress (circumference = 2 * PI * r = 2 * 3.14 * 45 ≈ 283)
    const circumference = 283;
    const offset = circumference - (matchPercValue / 100) * circumference;
    matchRing.style.strokeDashoffset = offset;

    // Update colors based on score
    matchRing.classList.remove('low', 'medium', 'high');
    matchStatus.classList.remove('low', 'medium', 'high');

    if (matchPercValue < 40) {
      matchRing.classList.add('low');
      matchStatus.classList.add('low');
      matchStatus.textContent = 'Needs improvement';
    } else if (matchPercValue < 70) {
      matchRing.classList.add('medium');
      matchStatus.classList.add('medium');
      matchStatus.textContent = 'Good match';
    } else {
      matchRing.classList.add('high');
      matchStatus.classList.add('high');
      matchStatus.textContent = 'Strong match!';
    }

    // Update skills tags
    matchingSkillsEl.innerHTML = matchingSkills.length > 0
      ? matchingSkills.map(s => `<span class="skill-tag match">${s}</span>`).join('')
      : '<span class="skill-tag">No exact matches found</span>';

    missingSkillsEl.innerHTML = missingSkills.length > 0
      ? missingSkills.slice(0, 8).map(s => `<span class="skill-tag missing">${s}</span>`).join('')
      : '<span class="skill-tag">All key skills covered!</span>';
  }

  // ATS Score checking (FREE)
  function checkATSScore(resumeText) {
    let score = 100;
    const issues = [];

    // Check for ATS-friendly characteristics
    const hasEducation = /education/i.test(resumeText);
    const hasExperience = /experience|work/i.test(resumeText);
    const hasSkills = /skills/i.test(resumeText);

    if (!hasEducation) { score -= 10; issues.push('Missing Education section'); }
    if (!hasExperience) { score -= 15; issues.push('Missing Experience section'); }
    if (!hasSkills) { score -= 10; issues.push('Missing Skills section'); }

    const hasEmail = /@/.test(resumeText);
    const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);

    if (!hasEmail) { score -= 10; issues.push('Missing email'); }
    if (!hasPhone) { score -= 5; issues.push('Missing phone number'); }

    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 150) { score -= 15; issues.push('Too short'); }
    if (wordCount > 1000) { score -= 10; issues.push('May be too long'); }

    const hasBullets = /[•\-\*]/.test(resumeText);
    if (hasBullets) { score = Math.min(100, score + 5); }

    const hasWeirdChars = /[^\w\s\-\.\,\:\;\(\)\@\|\•\/\&\'\"\!\?]/.test(resumeText);
    if (hasWeirdChars) { score -= 5; issues.push('Contains special characters'); }

    // Update UI
    atsScore.textContent = score;
    atsIcon.classList.remove('warning', 'error');
    atsScore.classList.remove('warning', 'error');

    if (score >= 80) {
      atsStatus.textContent = 'Optimized for ATS';
      atsIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`;
    } else if (score >= 60) {
      atsIcon.classList.add('warning');
      atsScore.classList.add('warning');
      atsStatus.textContent = issues[0] || 'Minor improvements needed';
      atsIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;
    } else {
      atsIcon.classList.add('error');
      atsScore.classList.add('error');
      atsStatus.textContent = issues[0] || 'Needs attention';
      atsIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
    }
  }

  // Generate tailored resume (Requires API Key)
  generateBtn.addEventListener('click', async () => {
    const company = companyInput.value.trim();
    const title = jobTitleInput.value.trim();
    const description = jobDescInput.value.trim();

    if (!description) {
      showError('Please enter a job description');
      return;
    }

    // Re-check API key
    const { anthropicApiKey } = await chrome.storage.sync.get('anthropicApiKey');
    if (!anthropicApiKey) {
      showError('Please add your Anthropic API key in settings to use AI generation');
      return;
    }

    hideError();
    generateBtn.disabled = true;
    loading.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'tailorResume',
        jobDescription: description,
        companyName: company || 'the company',
        jobTitle: title || 'this position'
      });

      if (response.success) {
        resumeOutput.textContent = response.data;
        resultsSection.classList.remove('hidden');
        chrome.storage.local.set({ draftResults: response.data });
        checkATSScore(response.data);
      } else {
        showError(response.error || 'Failed to generate resume');
      }
    } catch (error) {
      showError(error.message || 'An error occurred');
    } finally {
      loading.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resumeOutput.textContent);
      copyBtn.classList.add('success');
      setTimeout(() => copyBtn.classList.remove('success'), 1500);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  });

  // Download as text file
  downloadBtn.addEventListener('click', () => {
    const company = companyInput.value.trim() || 'tailored';
    const blob = new Blob([resumeOutput.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${company.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }
});
