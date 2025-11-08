import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { analyzeResume } from '../services/aiService.js';
import '../styles/AIResumeAnalyzer.css';

const AIResumeAnalyzer = ({ jobDescription, resumeFile, onAnalysisComplete }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // No more mock data - only real AI analysis

  // Real AI analysis function using OpenRouter
  const analyzeResumeWithAI = async (resume, jobDesc) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Use the real OpenRouter AI service
      const result = await analyzeResume(resume, jobDesc, {
        name: 'Candidate',
        email: 'candidate@example.com',
        github: 'https://github.com/candidate',
        education: 'Provided in resume',
        passingYear: '2023'
      });
      
      setAnalysisResult(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
      setError('Failed to analyze resume. Please ensure your OpenRouter API key is configured correctly and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };


  useEffect(() => {
    if (resumeFile && jobDescription) {
      analyzeResumeWithAI(resumeFile, jobDescription);
    }
  }, [resumeFile, jobDescription]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getDecisionColor = (decision) => {
    return decision === 'RECOMMENDED' ? '#27ae60' : '#e74c3c';
  };

  if (!resumeFile || !jobDescription) {
    return (
      <div className="ai-analyzer-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">🤖</div>
          <h3>AI Resume Analysis</h3>
          <p>Upload a resume and ensure job description is available to start AI analysis</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="ai-analyzer-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Analyzing Resume...</h3>
          <p>AI is evaluating the resume against job requirements</p>
          <div className="loading-steps">
            <div className="step active">📄 Parsing resume content</div>
            <div className="step active">🔍 Analyzing skills match</div>
            <div className="step active">📊 Calculating compatibility score</div>
            <div className="step">✅ Generating insights</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-analyzer-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Analysis Failed</h3>
          <p>{error}</p>
          <button 
            onClick={() => analyzeResumeWithAI(resumeFile, jobDescription)}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="ai-resume-analyzer">
      <div className="analyzer-header">
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
          <div className="decision-badge" style={{ backgroundColor: getDecisionColor(analysisResult.shortlistingDecision) }}>
            {analysisResult.shortlistingDecision === 'RECOMMENDED' ? '✅ RECOMMENDED' : '❌ NOT RECOMMENDED'}
          </div>
          <p className="decision-text">
            {analysisResult.shortlistingDecision === 'RECOMMENDED' 
              ? 'This candidate shows strong alignment with job requirements'
              : 'This candidate may need additional qualifications for this role'
            }
          </p>
          
          {/* CRITICAL: Show submission blocking warning */}
          {analysisResult.resumeScore < 60 && (
            <div className="submission-warning">
              <div className="warning-icon">🚫</div>
              <div className="warning-content">
                <h4>Submission Blocked</h4>
                <p>Score of {analysisResult.resumeScore}% is below the minimum threshold of 60%.</p>
                <p><strong>Application cannot be submitted until score improves.</strong></p>
              </div>
            </div>
          )}
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

      {/* Action Buttons */}
      <div className="analysis-actions">
        <button 
          onClick={() => {
            analyzeResumeWithAI(resumeFile, jobDescription);
          }}
          className="reanalyze-btn"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '🔄 Re-analyzing...' : '🔄 Re-analyze with AI'}
        </button>
        <button 
          onClick={() => {
            // Create a new PDF document
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;
            let yPosition = 30;

            // Helper function to add text with word wrapping
            const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
              doc.setFontSize(fontSize);
              doc.setTextColor(color[0], color[1], color[2]);
              if (isBold) {
                doc.setFont(undefined, 'bold');
              } else {
                doc.setFont(undefined, 'normal');
              }
              
              const lines = doc.splitTextToSize(text, maxWidth);
              lines.forEach(line => {
                if (yPosition > 280) { // Check if we need a new page
                  doc.addPage();
                  yPosition = 30;
                }
                doc.text(line, margin, yPosition);
                yPosition += fontSize * 0.5 + 2;
              });
              yPosition += 5; // Extra spacing after each section
            };

            // Header with gradient effect simulation
            doc.setFillColor(102, 126, 234);
            doc.rect(0, 0, pageWidth, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('🤖 AI RESUME ANALYSIS REPORT', pageWidth / 2, 17, { align: 'center' });

            // Reset position after header
            yPosition = 40;

            // Candidate Information Section
            addText('CANDIDATE INFORMATION', 16, true, [102, 126, 234]);
            addText(`Resume File: ${resumeFile.name}`);
            addText(`Analysis Date: ${new Date().toLocaleString()}`);
            addText(`Job Position: Senior Full Stack Developer`);
            addText(`Report ID: RPT-${Date.now()}`);

            yPosition += 10;

            // Overall Assessment with colored background
            doc.setFillColor(240, 248, 255);
            doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 35, 'F');
            
            addText('OVERALL ASSESSMENT', 16, true, [102, 126, 234]);
            
            // Score with color coding
            const scoreColor = analysisResult.resumeScore >= 80 ? [34, 197, 94] : 
                              analysisResult.resumeScore >= 60 ? [251, 146, 60] : [239, 68, 68];
            addText(`Resume Score: ${analysisResult.resumeScore}%`, 14, true, scoreColor);
            
            const decisionColor = analysisResult.shortlistingDecision === 'RECOMMENDED' ? [34, 197, 94] : [239, 68, 68];
            addText(`Recommendation: ${analysisResult.shortlistingDecision}`, 14, true, decisionColor);

            yPosition += 10;

            // Detailed Breakdown
            addText('DETAILED BREAKDOWN', 16, true, [102, 126, 234]);
            addText(`Technical Skills: ${analysisResult.detailedFeedback.technicalSkills}%`);
            addText(`Experience: ${analysisResult.detailedFeedback.experience}%`);
            addText(`Education: ${analysisResult.detailedFeedback.education}%`);
            addText(`Project Work: ${analysisResult.detailedFeedback.projectWork}%`);
            addText(`Communication: ${analysisResult.detailedFeedback.communication}%`);

            yPosition += 5;

            // Strengths Section
            addText('STRENGTHS', 16, true, [34, 197, 94]);
            analysisResult.keyInsights.strengths.forEach(strength => {
              addText(`• ${strength}`);
            });

            yPosition += 5;

            // Areas for Improvement
            addText('AREAS FOR IMPROVEMENT', 16, true, [251, 146, 60]);
            analysisResult.keyInsights.gaps.forEach(gap => {
              addText(`• ${gap}`);
            });

            yPosition += 5;

            // Skills Analysis
            addText('MATCHED SKILLS', 16, true, [34, 197, 94]);
            addText(analysisResult.keyInsights.matchedSkills.join(', '));

            yPosition += 5;

            addText('MISSING SKILLS', 16, true, [239, 68, 68]);
            addText(analysisResult.keyInsights.missingSkills.join(', '));

            yPosition += 5;

            // Recommendations
            addText('RECOMMENDATIONS', 16, true, [102, 126, 234]);
            analysisResult.recommendations.forEach(recommendation => {
              addText(`• ${recommendation}`);
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFillColor(102, 126, 234);
              doc.rect(0, 285, pageWidth, 12, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(10);
              doc.text('Generated by AI Resume Analyzer', margin, 292);
              doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 292, { align: 'right' });
            }

            // Save the PDF
            const fileName = `Resume_Analysis_Report_${resumeFile.name.split('.')[0]}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
          }}
          className="download-btn"
        >
          📥 Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;
