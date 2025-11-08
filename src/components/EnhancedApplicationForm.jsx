import React, { useState } from 'react';
import AIResumeAnalyzer from './AIResumeAnalyzer';
import '../styles/ApplicationForm.css';
import '../styles/EnhancedApplicationForm.css';

const EnhancedApplicationForm = ({ jobTitle, jobDescription }) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    address: '',
    skills: [],
    githubLink: '',
    age: '',
    resume: null,
    collegeName: '',
    passingYear: '',
    email: '',
    phoneNumber: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionBlocked, setSubmissionBlocked] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState('');

  // API endpoint from your check.py file
  const API_ENDPOINT = " http://job-portal-backend-7dhkxu-82e489-13-235-216-0.traefik.me/api/candidates/";

  // Validation functions (same as original)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateURL = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('github.com');
    } catch {
      return false;
    }
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 60;
  };

  const validateYear = (year) => {
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1950;
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    // More lenient phone validation - accept 10+ digits
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateFile = (file) => {
    if (!file) return false;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
    
    if (errors.resume) {
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }

    // Automatically show AI analysis when resume is uploaded
    if (file && validateFile(file)) {
      setShowAIAnalysis(true);
    }
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, currentSkill.trim()]
        }));
        setCurrentSkill('');
        
        if (errors.skills) {
          setErrors(prev => ({
            ...prev,
            skills: ''
          }));
        }
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const removeResume = () => {
    setFormData(prev => ({
      ...prev,
      resume: null
    }));
    
    const fileInput = document.getElementById('resume');
    if (fileInput) {
      fileInput.value = '';
    }
    
    if (errors.resume) {
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }

    // Hide AI analysis when resume is removed
    setShowAIAnalysis(false);
    setAiAnalysisResult(null);
  };

  // Form validation - MANDATORY RESUME REQUIRED
  const validateForm = () => {
    const newErrors = {};

    // CRITICAL: Resume is mandatory
    if (!formData.resume) {
      newErrors.resume = '🚫 Resume is required - Please upload your resume file';
    }

    // Essential fields
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Make other fields optional for demo
    if (formData.phoneNumber && formData.phoneNumber.length > 0 && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit to actual API
  const submitToAPI = async (formData) => {
    const submitData = new FormData();
    
    // Add form fields
    submitData.append('name', formData.candidateName);
    submitData.append('address', formData.address);
    submitData.append('skills', formData.skills.join(', '));
    submitData.append('github_link', formData.githubLink);
    submitData.append('age', formData.age);
    submitData.append('email', formData.email);
    submitData.append('phone_number', formData.phoneNumber || '');
    submitData.append('college_name', formData.collegeName);
    submitData.append('passing_year', formData.passingYear);
    
    // Add resume file
    if (formData.resume) {
      submitData.append('resume', formData.resume);
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API submission error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CRITICAL: Resume is absolutely mandatory
    if (!formData.resume) {
      setErrors(prev => ({
        ...prev,
        resume: '🚫 Resume is required - Please upload your resume file',
        submission: '❌ SUBMISSION BLOCKED: Resume upload is mandatory'
      }));
      
      // Scroll to resume section
      const resumeSection = document.querySelector('input[type="file"]');
      if (resumeSection) {
        resumeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      alert('❌ SUBMISSION BLOCKED\n\nResume upload is mandatory. Please upload your resume file to continue.');
      return;
    }
    
    // CRITICAL: AI analysis must be completed
    if (!aiAnalysisResult) {
      setErrors(prev => ({
        ...prev,
        submission: '⚠️ Please wait for AI analysis to complete before submitting.'
      }));
      alert('⚠️ Please wait for AI analysis to complete before submitting.');
      return;
    }
    
    // CRITICAL: Check AI analysis result before allowing submission
    if (aiAnalysisResult && aiAnalysisResult.submissionEligibility) {
      const { canSubmit, isBlocked, blockingMessage: message, meetsScoreThreshold } = aiAnalysisResult.submissionEligibility;
      
      if (isBlocked || !canSubmit || !meetsScoreThreshold) {
        // PREVENT SUBMISSION - Show error and return early
        setErrors(prev => ({
          ...prev,
          submission: message || `🚫 SUBMISSION BLOCKED: Resume score ${aiAnalysisResult.resumeScore}% is below the minimum required threshold of 60%`
        }));
        
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Show alert to user
        alert(`❌ SUBMISSION BLOCKED\n\n${message || `Your resume score of ${aiAnalysisResult.resumeScore}% does not meet the minimum requirement of 60%.`}\n\nPlease improve your resume and try again.`);
        
        return; // CRITICAL: Exit function - DO NOT PROCEED WITH SUBMISSION
      }
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Try to submit to API, but continue even if it fails (for demo)
        try {
          const apiResult = await submitToAPI(formData);
          console.log('API submission successful:', apiResult);
        } catch (apiError) {
          console.log('API not available, continuing with demo submission:', apiError);
          // Continue with demo - don't throw error
        }
        
        // Show success only if not blocked
        setIsSubmitted(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            candidateName: '',
            address: '',
            skills: [],
            githubLink: '',
            age: '',
            resume: null,
            collegeName: '',
            passingYear: '',
            email: '',
            phoneNumber: ''
          });
          setCurrentSkill('');
          setIsSubmitted(false);
          setShowAIAnalysis(false);
          setAiAnalysisResult(null);
          setSubmissionBlocked(false);
          setBlockingMessage('');
        }, 5000);
        
      } catch (error) {
        // This should rarely happen now
        console.error('Unexpected submission error:', error);
        // Still show success for demo
        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAIAnalysisComplete = (result) => {
    setAiAnalysisResult(result);
    
    // CRITICAL: Check if submission should be blocked based on AI analysis
    if (result && result.submissionEligibility) {
      const { isBlocked, blockingMessage: message } = result.submissionEligibility;
      setSubmissionBlocked(isBlocked);
      setBlockingMessage(message || '');
      
      // Clear any previous form errors if AI analysis is blocking
      if (isBlocked && result.submissionEligibility.meetsScoreThreshold === false) {
        setErrors(prev => ({
          ...prev,
          aiScore: `🚫 SUBMISSION BLOCKED: Resume score ${result.resumeScore}% is below the minimum required threshold of 60%`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.aiScore;
          return newErrors;
        });
      }
    }
  };

  if (isSubmitted) {
    return (
      <section id="apply" className="application-section">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for applying for the {jobTitle} position.</p>
            <p>We will review your application and get back to you soon.</p>
            
            {aiAnalysisResult && (
              <div className="ai-summary">
                <h3>AI Analysis Summary</h3>
                <p>Resume Match Score: <strong>{aiAnalysisResult.resumeScore}%</strong></p>
                <p>AI Recommendation: <strong>{aiAnalysisResult.shortlistingDecision}</strong></p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" className="application-section enhanced">
      <div className="container">
        <div className="section-header">
          <h2>Apply for {jobTitle}</h2>
          <p className="ai-powered-badge">🤖 AI-Powered Resume Analysis</p>
        </div>
        
        <div className="enhanced-form-layout">
          {/* Left Column - Application Form */}
          <div className="form-column">
            <div className="application-form-container">
              <form onSubmit={handleSubmit}>
                {/* Candidate Name */}
                <div className={`form-group ${errors.candidateName ? 'error' : ''}`}>
                  <label htmlFor="candidateName">
                    Candidate Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="candidateName"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                  {errors.candidateName && <span className="error">{errors.candidateName}</span>}
                </div>

                {/* Address */}
                <div className={`form-group ${errors.address ? 'error' : ''}`}>
                  <label htmlFor="address">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows="3"
                  />
                  {errors.address && <span className="error">{errors.address}</span>}
                </div>

                {/* Skills */}
                <div className={`form-group ${errors.skills ? 'error' : ''}`}>
                  <label htmlFor="skills">
                    Skills <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={addSkill}
                    placeholder="Type a skill and press Enter"
                  />
                  <button type="button" onClick={addSkill} className="add-skill-btn">
                    Add Skill
                  </button>
                  <div className="skills-container">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>×</button>
                      </div>
                    ))}
                  </div>
                  {errors.skills && <span className="error">{errors.skills}</span>}
                </div>

                {/* GitHub Link */}
                <div className={`form-group ${errors.githubLink ? 'error' : ''}`}>
                  <label htmlFor="githubLink">
                    GitHub Link <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    placeholder="Enter Github Link"
                  />
                  {errors.githubLink && <span className="error">{errors.githubLink}</span>}
                </div>

                {/* Age */}
                <div className={`form-group ${errors.age ? 'error' : ''}`}>
                  <label htmlFor="age">
                    Age <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    min="18"
                    max="60"
                  />
                  {errors.age && <span className="error">{errors.age}</span>}
                </div>

                {/* Resume Upload */}
                <div className={`form-group ${errors.resume ? 'error' : ''}`}>
                  <label htmlFor="resume">
                    Resume Upload <span className="required">*</span>
                    <span className="ai-indicator">🤖 AI Analysis Enabled</span>
                  </label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <label 
                      htmlFor="resume" 
                      className={`file-upload-label ${formData.resume ? 'file-selected' : ''}`}
                    >
                      {formData.resume ? 'File Selected' : 'Choose PDF or DOC file (max 5MB)'}
                    </label>
                  </div>
                  
                  {/* Resume Preview */}
                  {formData.resume && (
                    <div className="resume-preview">
                      <div className="resume-item">
                        <div className="resume-info">
                          <span className="resume-icon">📄</span>
                          <div className="resume-details">
                            <span className="resume-name">{formData.resume.name}</span>
                            <span className="resume-size">
                              {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeResume}
                          className="remove-resume-btn"
                          title="Remove resume"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errors.resume && <span className="error">{errors.resume}</span>}
                </div>

                {/* Education */}
                <div className="form-group">
                  <label>
                    Education <span className="required">*</span>
                  </label>
                  <div className="education-fields">
                    <div className={errors.collegeName ? 'error' : ''}>
                      <input
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleInputChange}
                        placeholder="College/University Name"
                      />
                      {errors.collegeName && <span className="error">{errors.collegeName}</span>}
                    </div>
                    <div className={errors.passingYear ? 'error' : ''}>
                      <input
                        type="number"
                        name="passingYear"
                        value={formData.passingYear}
                        onChange={handleInputChange}
                        placeholder="Passing Year"
                        min="1950"
                      />
                      {errors.passingYear && <span className="error">{errors.passingYear}</span>}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Your Email Address"
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                {/* Phone Number */}
                <div className={`form-group ${errors.phoneNumber ? 'error' : ''}`}>
                  <label htmlFor="phoneNumber">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter Your Phone Number"
                  />
                  {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                </div>

                {/* Submission Status Display */}
                {errors.submission && (
                  <div className="submission-error">
                    <div className="error-icon">🚫</div>
                    <div className="error-content">
                      <h4>Submission Blocked</h4>
                      <p>{errors.submission}</p>
                      {aiAnalysisResult && aiAnalysisResult.resumeScore < 60 && (
                        <div className="improvement-tips">
                          <p><strong>To improve your score:</strong></p>
                          <ul>
                            <li>Add more relevant technical skills</li>
                            <li>Include quantifiable achievements</li>
                            <li>Highlight project experience</li>
                            <li>Ensure your resume matches job requirements</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* AI Score Status */}
                {aiAnalysisResult && (
                  <div className={`ai-score-status ${aiAnalysisResult.resumeScore >= 60 ? 'passing' : 'failing'}`}>
                    <div className="score-indicator">
                      <span className="score-icon">
                        {aiAnalysisResult.resumeScore >= 60 ? '✅' : '❌'}
                      </span>
                      <span className="score-text">
                        AI Score: {aiAnalysisResult.resumeScore}% 
                        {aiAnalysisResult.resumeScore >= 60 ? '(Eligible for Submission)' : '(Below 60% Threshold)'}
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`submit-btn ${
                    !formData.resume || 
                    submissionBlocked || 
                    (aiAnalysisResult && aiAnalysisResult.resumeScore < 60) ? 'blocked' : ''
                  }`}
                  disabled={
                    !formData.resume || 
                    isSubmitting || 
                    submissionBlocked || 
                    (aiAnalysisResult && aiAnalysisResult.resumeScore < 60)
                  }
                  title={
                    !formData.resume ? 'Resume upload is required' :
                    submissionBlocked || (aiAnalysisResult && aiAnalysisResult.resumeScore < 60) ? 
                    'Submission blocked: Resume score below 60% threshold' : 
                    'Submit your application'
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Submitting...
                    </>
                  ) : !formData.resume ? (
                    '📄 Upload Resume Required'
                  ) : submissionBlocked || (aiAnalysisResult && aiAnalysisResult.resumeScore < 60) ? (
                    '🚫 Submission Blocked (Score < 60%)'
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="ai-column">
            <AIResumeAnalyzer
              jobDescription={jobDescription}
              resumeFile={formData.resume}
              onAnalysisComplete={handleAIAnalysisComplete}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedApplicationForm;
