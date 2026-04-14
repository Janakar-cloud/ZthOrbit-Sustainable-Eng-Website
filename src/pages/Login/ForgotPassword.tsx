import { useState } from 'react';
import './Login.css';
import { requestPasswordReset } from '../../utils/api';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) { setError('Email is required.'); return; }
    if (trimmed.length > 320) { setError('Email must be 320 characters or fewer.'); return; }

    try {
      setIsLoading(true);
      await requestPasswordReset(trimmed);
      setSent(true);
    } catch (err: any) {
      setError((err as Error)?.message || 'Request failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon">
              <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="brand-logo-image" />
            </div>
            <h1>The Green TV</h1>
            <p className="brand-tagline">Empowering Sustainability Through Conscious Leadership</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <h2>Forgot Password</h2>
              <p>Enter your email and we'll send you a reset link</p>
            </div>

            {sent ? (
              <div className="status-banner success" style={{ marginTop: '1rem' }}>
                <span className="material-icons">check_circle</span>
                <span>If that email is registered, a reset link has been sent. Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-icons">mail</span>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={320}
                      required
                    />
                  </div>
                  {error && <p className="error-text">{error}</p>}
                </div>

                <button type="submit" className="sigin-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="login-footer" style={{ marginTop: '1rem' }}>
              <p>
                Remember your password?{' '}
                <button type="button" className="link-button" onClick={() => onNavigate('login')}>
                  Sign in
                </button>
              </p>
            </div>
          </div>

          <div className="back-home">
            <button onClick={() => onNavigate('home')} className="back-button pill">
              <span className="material-icons">arrow_back</span>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
