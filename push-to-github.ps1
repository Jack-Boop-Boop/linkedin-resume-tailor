# Refresh PATH to include newly installed gh CLI
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Set-Location "C:\Users\jackb\Claude\linkedin-resume-tailor"

# Check gh version
Write-Host "Checking GitHub CLI..."
gh --version

# Check auth status
Write-Host "`nChecking authentication..."
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not authenticated. Starting login..."
    gh auth login --web
}

# Configure git
Write-Host "`nConfiguring git..."
git config user.name "jackbergin"
git config user.email "jack.bergin@maine.edu"

# Stage all files
Write-Host "`nStaging files..."
git add .

# Commit
Write-Host "`nCreating commit..."
git commit -m "Initial commit: LinkedIn Resume Tailor Chrome Extension

Features:
- AI-powered resume tailoring using Claude API
- Auto-extract job details from LinkedIn
- Skills match score analysis
- ATS-friendly checker
- Auto-save drafts
- Copy/download tailored resumes"

# Create GitHub repo and push
Write-Host "`nCreating GitHub repository..."
gh repo create linkedin-resume-tailor --public --source=. --remote=origin --push --description "Chrome extension that uses Claude AI to tailor your resume for LinkedIn job applications"

Write-Host "`nDone! Check your GitHub for the new repository."
