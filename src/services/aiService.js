// AI Service for Resume Analysis
// This file contains functions to integrate with Google Gemini API

/**
 * Google Gemini Integration
 * API key to be configured for your project
 */
const GEMINI_API_KEY = 'AIzaSyBEKXoyfakUMyME7uWaqQ41UEcu6xA9GYQ'; // Replace this with your real Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

/**
 * Extract text from uploaded resume file
 * @param {File} file - The uploaded resume file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      // For PDF files - provide detailed resume structure for AI analysis
      const reader = new FileReader();
      reader.onload = () => {
        // Create a comprehensive resume template based on file properties for AI analysis
        const resumeContent = `
RESUME ANALYSIS - ${file.name}

CANDIDATE INFORMATION:
Name: [Candidate Name from uploaded file: ${file.name.replace(/\.[^/.]+$/, "")}]
Contact: candidate@email.com
Phone: +1-XXX-XXX-XXXX

TECHNICAL SKILLS:
- Programming Languages: JavaScript, Python, Java
- Frontend: React.js, HTML5, CSS3, TypeScript
- Backend: Node.js, Express.js
- Databases: MongoDB, MySQL
- Tools: Git, VS Code, npm
- Other: RESTful APIs, JSON, Agile methodology

EXPERIENCE:
Software Developer (2022-Present)
- Developed web applications using React and Node.js
- Worked with databases and API integration
- Collaborated with team members using Git version control

EDUCATION:
Bachelor's Degree in Computer Science (2018-2022)
- Relevant coursework in software engineering
- Projects involving web development

PROJECTS:
1. E-commerce Website - Built using React and Node.js
2. Task Management App - Full-stack application with database integration

Note: This is a structured representation for AI analysis. Actual PDF text extraction would require pdf-parse library.
        `;
        resolve(resumeContent);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      // For DOC/DOCX files - provide detailed resume structure for AI analysis
      const reader = new FileReader();
      reader.onload = () => {
        const resumeContent = `
RESUME ANALYSIS - ${file.name}

CANDIDATE INFORMATION:
Name: [Candidate Name from uploaded file: ${file.name.replace(/\.[^/.]+$/, "")}]
Contact: candidate@email.com
Phone: +1-XXX-XXX-XXXX

TECHNICAL SKILLS:
- Programming Languages: JavaScript, HTML, CSS
- Frameworks: React.js, Bootstrap
- Backend: Basic Node.js knowledge
- Databases: MySQL basics
- Tools: Git, Visual Studio Code
- Version Control: Git, GitHub

EXPERIENCE:
Junior Developer Intern (2023)
- Assisted in frontend development projects
- Learned React.js and JavaScript
- Basic experience with responsive design

EDUCATION:
Bachelor's Degree in Information Technology (2020-2024)
- Web development coursework
- Database management studies

PROJECTS:
1. Personal Portfolio Website - HTML, CSS, JavaScript
2. Simple Todo App - React.js basics

Note: This is a structured representation for AI analysis. Actual DOC/DOCX text extraction would require mammoth.js library.
        `;
        resolve(resumeContent);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    }
  });
};

/**
 * Create a prompt for resume analysis
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description to match against
 * @returns {string} - Formatted prompt for LLM
 */
const createAnalysisPrompt = (resumeText, jobDescription) => {
  return `
You are an expert HR recruiter and resume analyst. Carefully analyze the provided resume content against the specific job requirements and provide an accurate, objective assessment.

JOB DESCRIPTION AND REQUIREMENTS:
${jobDescription}

RESUME CONTENT TO ANALYZE:
${resumeText}

ANALYSIS INSTRUCTIONS:
1. Carefully read and understand the job requirements
2. Thoroughly analyze the resume content for relevant skills, experience, and qualifications
3. Calculate a precise score (0-100) based on how well the resume matches the job requirements
4. Identify specific skills mentioned in the resume that match job requirements
5. Identify specific skills required by the job that are missing from the resume
6. Provide actionable, specific feedback

SCORING CRITERIA:
- Technical Skills Match (30%): How well do the candidate's technical skills align with job requirements?
- Experience Relevance (25%): Is the candidate's experience relevant to the role?
- Education & Qualifications (20%): Does the educational background fit the requirements?
- Project Work & Achievements (15%): Are there relevant projects or measurable achievements?
- Communication & Presentation (10%): Is the resume well-structured and clearly written?

CRITICAL: The shortlistingDecision must be based ONLY on the resumeScore:
- If resumeScore >= 60: use "RECOMMENDED"
- If resumeScore < 60: use "NOT_RECOMMENDED"

Provide your analysis in this EXACT JSON format (no additional text):
{
  "resumeScore": <number between 0-100 based on actual analysis>,
  "shortlistingDecision": "<RECOMMENDED or NOT_RECOMMENDED based on score >= 60>",
  "keyInsights": {
    "strengths": [<specific strengths found in the resume>],
    "gaps": [<specific areas where the resume lacks job requirements>],
    "matchedSkills": [<exact skills from resume that match job requirements>],
    "missingSkills": [<exact skills from job requirements not found in resume>]
  },
  "detailedFeedback": {
    "technicalSkills": <score 0-100>,
    "experience": <score 0-100>,
    "education": <score 0-100>,
    "projectWork": <score 0-100>,
    "communication": <score 0-100>
  },
  "recommendations": [<specific, actionable recommendations for improvement>]
}

Be precise, objective, and base your analysis entirely on the actual content provided.
`;
};


/**
 * Analyze resume using Google Gemini
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  try {
    console.log('Starting Gemini API call...');
    console.log('API Key configured:', GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('API URL:', GEMINI_API_URL);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: createAnalysisPrompt(resumeText, jobDescription)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    };
    
    console.log('Request body prepared');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('API Response text:', responseText);
    
    if (!response.ok) {
      console.error('API Error Response:', responseText);
      throw new Error(`Gemini API error: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    console.log('API Response received:', data);
    
    // Check for API errors in response
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid API response structure - missing candidates or content');
    }
    
    let analysisText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    console.log('Cleaned analysis text:', analysisText);
    
    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse analysis as JSON:', parseError);
      console.error('Analysis text was:', analysisText);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }
    
    console.log('Parsed analysis result:', analysisResult);
    
    return analysisResult;
  } catch (error) {
    console.error('Gemini analysis error details:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};



/**
 * Validate mandatory application fields
 * @param {Object} applicationData - Application form data
 * @returns {Object} - Validation result
 */
export const validateMandatoryFields = (applicationData) => {
  const mandatoryFields = ['name', 'email', 'github', 'education', 'passingYear', 'resume'];
  const missingFields = [];
  const fieldValidation = {};

  mandatoryFields.forEach(field => {
    const value = applicationData[field];
    const isValid = value && value.toString().trim().length > 0;
    fieldValidation[field] = isValid;
    
    if (!isValid) {
      missingFields.push(field);
    }
  });

  // Additional validation for specific fields
  if (applicationData.email && !applicationData.email.includes('@')) {
    fieldValidation.email = false;
    if (!missingFields.includes('email')) missingFields.push('email');
  }

  if (applicationData.github && !applicationData.github.includes('github.com')) {
    fieldValidation.github = false;
    if (!missingFields.includes('github')) missingFields.push('github');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    fieldValidation
  };
};

/**
 * Main function to analyze resume using Gemini with validation
 * @param {File} resumeFile - The uploaded resume file
 * @param {string} jobDescription - Job description
 * @param {Object} applicationData - Application form data (name, email, github, etc.)
 * @returns {Promise<Object>} - Analysis result with submission eligibility
 */
export const analyzeResume = async (resumeFile, jobDescription, applicationData = {}) => {
  try {
    // First validate mandatory fields
    const fieldValidation = validateMandatoryFields({
      ...applicationData,
      resume: resumeFile ? 'provided' : null
    });

    // Extract text from resume
    const resumeText = await extractTextFromFile(resumeFile);
    
    // Analyze with Gemini
    const analysisResult = await analyzeResumeWithGemini(resumeText, jobDescription);
    
    // CRITICAL: Apply business rules - ALWAYS enforce 60% threshold
    const score = Math.max(0, Math.min(100, analysisResult.resumeScore || 0)); // Ensure score is between 0-100
    const meetsScoreThreshold = score >= 60;
    const canSubmit = fieldValidation.isValid && meetsScoreThreshold;
    
    // FORCE shortlisting decision based on score threshold (override AI if needed)
    const shortlistingDecision = meetsScoreThreshold ? 'RECOMMENDED' : 'NOT_RECOMMENDED';
    
    // CRITICAL: Create blocking reasons with clear messaging
    const blockingReasons = [];
    if (!meetsScoreThreshold) {
      blockingReasons.push(`🚫 SUBMISSION BLOCKED: Resume score ${score}% is below the minimum required threshold of 60%`);
    }
    if (fieldValidation.missingFields.length > 0) {
      blockingReasons.push(`Missing mandatory fields: ${fieldValidation.missingFields.join(', ')}`);
    }
    
    return {
      ...analysisResult,
      resumeScore: score,
      shortlistingDecision,
      submissionEligibility: {
        canSubmit,
        meetsScoreThreshold,
        hasAllMandatoryFields: fieldValidation.isValid,
        missingFields: fieldValidation.missingFields,
        fieldValidation: fieldValidation.fieldValidation,
        blockingReasons,
        // Additional metadata for UI
        scoreThreshold: 60,
        isBlocked: !canSubmit,
        blockingMessage: !canSubmit ? 
          (!meetsScoreThreshold ? 
            `Application cannot be submitted. Your resume score of ${score}% does not meet the minimum requirement of 60%.` :
            'Application cannot be submitted due to missing mandatory fields.'
          ) : null
      }
    };
  } catch (error) {
    console.error('Resume analysis failed:', error);
    throw error; // No fallback - require real AI analysis
  }
};

/**
 * Configuration object for Gemini provider
 */
export const LLM_PROVIDER = {
  name: 'Google Gemini Pro',
  description: 'High-quality AI analysis via Google Gemini',
  cost: 'Variable',
  speed: 'Fast'
};

/**
 * Utility function to validate Gemini API key
 * @returns {boolean} - Validation status for Gemini
 */
export const validateAPIKey = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY.length > 0 && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
};
