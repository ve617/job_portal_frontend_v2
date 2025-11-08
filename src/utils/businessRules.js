// Business Rules Utility Functions
// Use these functions in your frontend to ensure consistent logic

/**
 * Apply business rules to analysis result
 * This ensures the 60% threshold rule is always enforced
 * @param {Object} analysisResult - Result from AI analysis
 * @returns {Object} - Corrected analysis result
 */
export const applyBusinessRules = (analysisResult) => {
  if (!analysisResult) return null;
  
  const score = analysisResult.resumeScore || 0;
  const correctedDecision = score >= 60 ? 'RECOMMENDED' : 'NOT_RECOMMENDED';
  
  return {
    ...analysisResult,
    shortlistingDecision: correctedDecision,
    meetsThreshold: score >= 60,
    thresholdMessage: score >= 60 
      ? `Score ${score}% meets the 60% minimum requirement` 
      : `Score ${score}% is below the 60% minimum requirement`
  };
};

/**
 * Get recommendation status with styling
 * @param {number} score - Resume score (0-100)
 * @returns {Object} - Status object with styling info
 */
export const getRecommendationStatus = (score) => {
  const meetsThreshold = score >= 60;
  
  return {
    decision: meetsThreshold ? 'RECOMMENDED' : 'NOT_RECOMMENDED',
    meetsThreshold,
    score,
    statusColor: meetsThreshold ? 'green' : 'red',
    statusIcon: meetsThreshold ? '✅' : '❌',
    message: meetsThreshold 
      ? 'This candidate meets the minimum qualifications'
      : 'This candidate may need additional qualifications for this role',
    canSubmit: meetsThreshold
  };
};

/**
 * Validate application completeness
 * @param {Object} applicationData - Form data
 * @returns {Object} - Validation result
 */
export const validateApplication = (applicationData) => {
  const requiredFields = ['name', 'email', 'github', 'education', 'passingYear'];
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!applicationData[field] || applicationData[field].toString().trim() === '') {
      missing.push(field);
    }
  });
  
  // Validate email format
  if (applicationData.email && !applicationData.email.includes('@')) {
    if (!missing.includes('email')) missing.push('email');
  }
  
  // Validate GitHub URL
  if (applicationData.github && !applicationData.github.includes('github.com')) {
    if (!missing.includes('github')) missing.push('github');
  }
  
  // Check for resume file
  if (!applicationData.resume && !applicationData.resumeFile) {
    missing.push('resume');
  }
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    canProceed: missing.length === 0
  };
};

/**
 * Get final submission eligibility
 * @param {Object} analysisResult - AI analysis result
 * @param {Object} applicationData - Form data
 * @returns {Object} - Final eligibility decision
 */
export const getFinalEligibility = (analysisResult, applicationData) => {
  const validation = validateApplication(applicationData);
  const status = getRecommendationStatus(analysisResult.resumeScore || 0);
  
  const canSubmit = validation.isValid && status.canSubmit;
  const blockingReasons = [];
  
  if (!validation.isValid) {
    blockingReasons.push(`Missing required fields: ${validation.missingFields.join(', ')}`);
  }
  
  if (!status.canSubmit) {
    blockingReasons.push(`Score ${status.score}% is below 60% minimum threshold`);
  }
  
  return {
    canSubmit,
    meetsAllRequirements: canSubmit,
    blockingReasons,
    validation,
    scoreStatus: status,
    summary: canSubmit 
      ? '✅ Application ready for submission'
      : `❌ Application blocked: ${blockingReasons.join('; ')}`
  };
};

// Export constants for consistency
export const BUSINESS_RULES = {
  MINIMUM_SCORE: 60,
  REQUIRED_FIELDS: ['name', 'email', 'github', 'education', 'passingYear', 'resume'],
  DECISIONS: {
    RECOMMENDED: 'RECOMMENDED',
    NOT_RECOMMENDED: 'NOT_RECOMMENDED'
  }
};
