import { useState, useEffect } from 'react';
import './Login.css';
import { resetPassword } from '../../utils/api';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export default function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    if (!t) setError('Invalid or missing reset token. Please request a new link.');
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('Invalid or missing reset token.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    try {
      setIsLoading(true);
      await resetPassword({ token, password });
      setDone(true);
    } catch (err: any) {
      setError((err as Error)?.message || 'Reset failed. The link may have expired.');
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
              <h2>Reset Password</h2>
              <p>Enter your new password below</p>
            </div>

            {done ? (
              <>
                <div className="status-banner success" style={{ marginTop: '1rem' }}>
                  <span className="material-icons">check_circle</span>
                  <span>Password reset successfully! You can now sign in.</span>
                </div>
                <div className="login-footer" style={{ marginTop: '1rem' }}>
                  <button type="button" className="sigin-btn-primary" onClick={() => onNavigate('login')}>
                    Go to Sign In
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-form-group">
                  <label htmlFor="password">New Password</label>
                  <div className="input-wrapper">
                    <span className="material-icons">lock</span>
                    <input
                      type="password"
                      id="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="confirm">Confirm New Password</label>
                  <div className="input-wrapper">
                    <span className="material-icons">lock_outline</span>
                    <input
                      type="password"
                      id="confirm"
                      placeholder="Repeat new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="status-banner error">
                    <span className="material-icons">error_outline</span>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="sigin-btn-primary" disabled={isLoading || !token}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>

          <div className="back-home">
            <button onClick={() => onNavigate('login')} className="back-button pill">
              <span className="material-icons">arrow_back</span>
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
