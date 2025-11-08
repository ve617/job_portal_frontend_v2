import React, { useState, useRef, useEffect } from 'react';
import { analyzeResume } from '../services/aiService.js';
import AIResumeAnalyzer from './AIResumeAnalyzer.jsx';
import '../styles/ResumeAnalysisSection.css';

const ResumeAnalysisSection = ({ jobDescription, jobTitle }) => {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'analyzing', 'results'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        // Stay on upload step, just enable the verify button
      } else {
        alert('Please upload a PDF or DOC/DOCX file only.');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        // Stay on upload step, just enable the verify button
      } else {
        alert('Please upload a PDF or DOC/DOCX file only.');
      }
    }
  };

  // Handle verify button click to start analysis
  const handleVerifyClick = () => {
    if (uploadedFile) {
      setCurrentStep('analyzing');
    }
  };

  // Run analysis when step changes to analyzing
  useEffect(() => {
    if (uploadedFile && currentStep === 'analyzing') {
      const runAnalysis = async () => {
        try {
          // Use the real AI service to analyze the resume
          const result = await analyzeResume(uploadedFile, jobDescription, {
            name: 'Candidate',
            email: 'candidate@example.com',
            github: 'https://github.com/candidate',
            education: 'Provided in resume',
            passingYear: '2023'
          });
          
          setAnalysisResult(result);
          setCurrentStep('results');
        } catch (error) {
          console.error('Analysis failed:', error);
          // On error, go back to upload with an alert
          alert('Analysis failed. Please try again.');
          setCurrentStep('upload');
          setUploadedFile(null);
        }
      };

      // Add a small delay to show the analyzing animation
      const timer = setTimeout(runAnalysis, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, uploadedFile, jobDescription]);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentStep('results');
  };

  const resetAnalysis = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setAnalysisResult(null);
    setShowDetailedModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <section id="resume-analysis" className="resume-analysis-section">
      <div className="container">
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="upload-container">
            <h2>ANALYZE RESUME</h2>
            <div className="upload-area">
              <div 
                className="file-drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-content">
                  <div className="upload-icon">📄</div>
                  <h3>Resume Upload *</h3>
                  <p>{uploadedFile ? `Selected: ${uploadedFile.name}` : 'Choose PDF or DOC file (max 5MB)'}</p>
                  <div className="upload-actions">
                    <button className="upload-btn">
                      {uploadedFile ? 'Change File' : 'Choose File'}
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <button 
                className="verify-btn" 
                disabled={!uploadedFile}
                onClick={handleVerifyClick}
              >
                VERIFY JOB ELIGIBILITY
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {currentStep === 'analyzing' && (
          <div className="analyzing-container">
            <div className="analyzing-circle">
              <div className="analyzing-spinner"></div>
              <div className="analyzing-content">
                <h3>Analyzing</h3>
                <p>Resume</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && analysisResult && (
          <div className="results-container">
            <h2 className={analysisResult.resumeScore >= 60 ? "qualified" : "not-qualified"}>
              {analysisResult.resumeScore >= 60 
                ? "You qualify for the position." 
                : "You do not qualify for the position."}
            </h2>
            
            <div className="resume-info">
              <div className="resume-file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h4>{uploadedFile.name}</h4>
                  <p>Introducing Developer: A talented software engineer with a passion for creating innovative solutions. With expertise in various programming languages and frameworks.</p>
                </div>
              </div>
            </div>

            <div className="score-section">
              <h3>Resume Score</h3>
              <div className="score-circles">
                <div className="score-circle">
                  <div className="circle-progress" style={{ 
                    background: `conic-gradient(${getScoreColor(analysisResult.resumeScore)} ${analysisResult.resumeScore * 3.6}deg, #f0f0f0 0deg)` 
                  }}>
                    <div className="circle-inner">
                      <span className="score-value">{analysisResult.resumeScore}%</span>
                      <span className="score-label">Overall Score</span>
                    </div>
                  </div>
                  <p>{analysisResult.resumeScore}%</p>
                </div>

                <div className="score-circle">
                  <div className="circle-progress" style={{ 
                    background: `conic-gradient(${getScoreColor(analysisResult.detailedFeedback.technicalSkills)} ${analysisResult.detailedFeedback.technicalSkills * 3.6}deg, #f0f0f0 0deg)` 
                  }}>
                    <div className="circle-inner">
                      <span className="score-value">{analysisResult.detailedFeedback.technicalSkills}%</span>
                      <span className="score-label">Requirements Score</span>
                    </div>
                  </div>
                  <p>{analysisResult.detailedFeedback.technicalSkills}%</p>
                </div>

                <div className="score-circle">
                  <div className="circle-progress" style={{ 
                    background: `conic-gradient(${getScoreColor(analysisResult.keyInsights.matchedSkills.length * 10)} ${analysisResult.keyInsights.matchedSkills.length * 36}deg, #f0f0f0 0deg)` 
                  }}>
                    <div className="circle-inner">
                      <span className="score-value">{analysisResult.keyInsights.matchedSkills.length * 10}%</span>
                      <span className="score-label">Keywords Score</span>
                    </div>
                  </div>
                  <p>{analysisResult.keyInsights.matchedSkills.length * 10}%</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="view-report-btn"
                onClick={() => setShowDetailedModal(true)}
              >
                VIEW FULL REPORT
              </button>
            </div>
          </div>
        )}

        {/* Detailed Analysis Modal */}
        {showDetailedModal && analysisResult && (
          <div className="modal-overlay" onClick={() => setShowDetailedModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button 
                  className="close-btn"
                  onClick={() => setShowDetailedModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="detailed-analysis-display">
                  <div className="analysis-header">
                    <h3>🤖 AI Resume Analysis</h3>
                    <div className="analysis-info">
                      <div className="analysis-timestamp">
                        Analyzed: {new Date().toLocaleString()}
                      </div>
                      <div className="consistency-badge">
                        🔒 Consistent Results
                      </div>
                    </div>
                  </div>

                  {/* Overall Score and Decision */}
                  <div className="analysis-overview">
                    <div className="score-card">
                      <div className="score-circle">
                        <div 
                          className="score-fill" 
                          style={{ 
                            background: `conic-gradient(${getScoreColor(analysisResult.resumeScore)} ${analysisResult.resumeScore * 3.6}deg, #f0f0f0 0deg)`
                          }}
                        >
                          <div className="score-inner">
                            <span className="score-value">{analysisResult.resumeScore}%</span>
                            <span className="score-label">Match Score</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="decision-card">
                      <div className="decision-badge" style={{ backgroundColor: getScoreColor(analysisResult.resumeScore) }}>
                        {analysisResult.shortlistingDecision === 'RECOMMENDED' ? '✅ RECOMMENDED' : '❌ NOT RECOMMENDED'}
                      </div>
                      <p className="decision-text">
                        {analysisResult.shortlistingDecision === 'RECOMMENDED' 
                          ? 'This candidate shows strong alignment with job requirements'
                          : 'This candidate may need additional qualifications for this role'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="detailed-breakdown">
                    <h4>📊 Detailed Assessment</h4>
                    <div className="breakdown-grid">
                      {Object.entries(analysisResult.detailedFeedback).map(([category, score]) => (
                        <div key={category} className="breakdown-item">
                          <div className="breakdown-header">
                            <span className="category-name">
                              {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="category-score">{score}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${score}%`,
                                backgroundColor: getScoreColor(score)
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Analysis */}
                  <div className="skills-analysis">
                    <div className="skills-section">
                      <h4>✅ Matched Skills</h4>
                      <div className="skills-list matched">
                        {analysisResult.keyInsights.matchedSkills.map((skill, index) => (
                          <span key={index} className="skill-tag matched">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="skills-section">
                      <h4>❌ Missing Skills</h4>
                      <div className="skills-list missing">
                        {analysisResult.keyInsights.missingSkills.map((skill, index) => (
                          <span key={index} className="skill-tag missing">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="key-insights">
                    <div className="insights-section">
                      <h4>💪 Strengths</h4>
                      <ul className="insights-list strengths">
                        {analysisResult.keyInsights.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="insights-section">
                      <h4>🎯 Areas for Improvement</h4>
                      <ul className="insights-list gaps">
                        {analysisResult.keyInsights.gaps.map((gap, index) => (
                          <li key={index}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="recommendations">
                    <h4>💡 Recommendations</h4>
                    <ul className="recommendations-list">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button for Eligible Candidates */}
                  {analysisResult.resumeScore >= 60 && (
                    <div className="apply-section">
                      <button 
                        className="apply-btn"
                        onClick={() => {
                          setShowDetailedModal(false);
                          // Scroll to application form section
                          const applicationSection = document.getElementById('apply');
                          if (applicationSection) {
                            applicationSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        🚀 APPLY FOR THIS POSITION
                      </button>
                      <p className="apply-note">
                        Great news! Your resume meets our requirements. Click above to proceed with your application.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset button for testing */}
        {(currentStep === 'results' || currentStep === 'analyzing') && (
          <div className="reset-section">
            <button className="reset-btn" onClick={resetAnalysis}>
              Upload New Resume
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResumeAnalysisSection;
