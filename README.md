# 🤖 AI Resume Analyzer

A modern job portal with AI-powered resume analysis using Google Gemini API.

## ✨ Features

- **AI Resume Analysis**: Upload resume, get instant AI-powered scoring
- **Real-Time Scoring**: 0-100 score based on job requirements match
- **Skills Gap Analysis**: See matched and missing skills
- **PDF Reports**: Generate professional analysis reports
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Purple gradient theme with smooth animations

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/adi-0903/SDLC-v2.0.git
cd SDLC-v2.0

# Install and run
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📋 Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- npm v7+
- Modern web browser

## 🤖 How the AI Works

The application uses **Google Gemini API** to analyze resumes:

```
1. Upload Resume
   ↓
2. Extract Text (PDF/DOC)
   ↓
3. Send to Gemini AI with Job Description
   ↓
4. AI Analyzes and Scores Resume
   ├─ Technical Skills Match (30%)
   ├─ Experience Relevance (25%)
   ├─ Education & Qualifications (20%)
   ├─ Project Work (15%)
   └─ Communication (10%)
   ↓
5. Display Results & Recommendations
   ├─ Resume Score (0-100)
   ├─ Matched Skills
   ├─ Missing Skills
   └─ Improvement Tips
```

**Auto-Submit Rule**: Score ≥ 60% → Automatically submitted for review

## 🔧 Configuration

### Set Gemini API Key

Edit `src/services/aiService.js`:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Set Backend API

Edit `src/components/EnhancedApplicationForm.jsx`:

```javascript
const API_ENDPOINT = "YOUR_BACKEND_API_URL/api/candidates/";
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AIResumeAnalyzer.jsx
│   ├── EnhancedApplicationForm.jsx
│   ├── ResumeAnalysisSection.jsx
│   └── ...
├── services/
│   └── aiService.js
├── styles/
│   └── ...
└── App.jsx
```

## 💻 Usage

### For Candidates

1. **Upload Resume**: Drag & drop PDF/DOC file
2. **Wait for Analysis**: AI processes your resume
3. **View Results**: See score, skills match, and recommendations
4. **Download Report**: Get PDF analysis report

### For Recruiters

1. Review candidate submissions
2. Check AI analysis scores
3. Download detailed reports
4. Make hiring decisions

## 🎨 Styling

- **Color Theme**: Purple-blue gradient
- **Design**: Glass morphism with smooth animations
- **Responsive**: Mobile-first approach
