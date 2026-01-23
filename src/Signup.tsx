import { useState } from 'react';
import './Signup.css';

interface SignupProps {
  onNavigate: (page: string) => void;
  onComplete: () => void;
}

export default function Signup({ onNavigate, onComplete }: SignupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: '',
    interests: [] as string[],
    goals: '',
  });

  const interestOptions = [
    'Sustainability',
    'Leadership',
    'Environmental Innovation',
    'Corporate Governance',
    'Green Technology',
    'Climate Action',
    'Conscious Living',
    'Social Impact',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete signup
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email;
      case 2:
        return formData.interests.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <button onClick={() => onNavigate('login')} className="back-link">
            <span className="material-icons">arrow_back</span>
            Back to Login
          </button>
          <div className="logo-small">
            <span className="material-icons">eco</span>
            <span>Green Generation TV</span>
          </div>
        </div>

        <div className="signup-content">
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
            <div className="step-indicators">
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
                <div className="step-circle">
                  {step > 1 ? <span className="material-icons">check</span> : '1'}
                </div>
                <span>Personal Info</span>
              </div>
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
                <div className="step-circle">
                  {step > 2 ? <span className="material-icons">check</span> : '2'}
                </div>
                <span>Interests</span>
              </div>
              <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span>Goals</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="step-content" key="step1">
                <div className="step-header">
                  <h2>Let's get to know you</h2>
                  <p>Tell us a bit about yourself to personalize your experience</p>
                </div>

                <div className="form-fields">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="organization">Organization (Optional)</label>
                    <input
                      type="text"
                      id="organization"
                      placeholder="Company or organization name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role (Optional)</label>
                    <input
                      type="text"
                      id="role"
                      placeholder="Your role or title"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <div className="step-content" key="step2">
                <div className="step-header">
                  <h2>What interests you?</h2>
                  <p>Select topics you'd like to explore (choose at least one)</p>
                </div>

                <div className="interests-grid">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      className={`interest-card ${
                        formData.interests.includes(interest) ? 'selected' : ''
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      <span className="material-icons">
                        {formData.interests.includes(interest) ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>{interest}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <div className="step-content" key="step3">
                <div className="step-header">
                  <h2>What are your goals?</h2>
                  <p>Help us understand what you hope to achieve</p>
                </div>

                <div className="form-fields">
                  <div className="form-group">
                    <label htmlFor="goals">Tell us about your sustainability goals</label>
                    <textarea
                      id="goals"
                      rows={6}
                      placeholder="Share what you hope to learn or achieve through Green Generation TV..."
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="summary-card">
                    <h3>Your Profile Summary</h3>
                    <div className="summary-item">
                      <span className="material-icons">person</span>
                      <div>
                        <strong>{formData.fullName}</strong>
                        <p>{formData.email}</p>
                      </div>
                    </div>
                    {formData.organization && (
                      <div className="summary-item">
                        <span className="material-icons">business</span>
                        <div>
                          <strong>{formData.organization}</strong>
                          {formData.role && <p>{formData.role}</p>}
                        </div>
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="material-icons">interests</span>
                      <div>
                        <strong>Interests</strong>
                        <p>{formData.interests.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              {step > 1 && (
                <button className="btn-secondary" onClick={handleBack}>
                  <span className="material-icons">arrow_back</span>
                  Back
                </button>
              )}
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {step === 3 ? (
                  <>
                    Complete Setup
                    <span className="material-icons">check</span>
                  </>
                ) : (
                  <>
                    Continue
                    <span className="material-icons">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
