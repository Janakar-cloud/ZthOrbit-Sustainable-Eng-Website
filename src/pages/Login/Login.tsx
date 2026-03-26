import { useState } from 'react';
import './Login.css';
import { login, register, resendVerification, verifyEmail } from '../../utils/api';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

type StatusState = {
  message: string;
  variant: 'info' | 'error' | 'success';
} | null;

type Mode = 'login' | 'register' | 'verify';

export default function Login({ onNavigate, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  const storeTokens = (accessToken: string, refreshToken: string) => {
    if (rememberMe) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!email.trim()) {
      setStatus({ message: 'Email is required.', variant: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      if (mode === 'register') {
        if (!password.trim()) {
          setStatus({ message: 'Password is required to register.', variant: 'error' });
          setIsLoading(false);
          return;
        }
        await register({ email: email.trim(), password: password.trim() });
        setMode('verify');
        setStatus({ message: 'Code sent. Check your email.', variant: 'success' });
        return;
      }

      if (mode === 'verify') {
        if (code.trim().length !== 6) {
          setStatus({ message: 'Enter the 6-digit code.', variant: 'error' });
          setIsLoading(false);
          return;
        }
        const tokens = await verifyEmail({ email: email.trim(), code: code.trim() });
        storeTokens(tokens.accessToken, tokens.refreshToken);
        setStatus({ message: 'Verified! Logging you in...', variant: 'success' });
        onLogin();
        return;
      }

      // login
      if (!password.trim()) {
        setStatus({ message: 'Password is required.', variant: 'error' });
        setIsLoading(false);
        return;
      }
      const tokens = await login({ email: email.trim(), password: password.trim() });
      storeTokens(tokens.accessToken, tokens.refreshToken);
      setStatus({ message: 'Welcome back! Redirecting...', variant: 'success' });
      onLogin();
    } catch (err: any) {
      const msg = (err as Error)?.message || 'Request failed';
      if (msg.toLowerCase().includes('verify')) {
        setMode('verify');
      }
      setStatus({ message: msg, variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setStatus({ message: 'Password reset flow not yet wired.', variant: 'info' });
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setStatus({ message: 'Enter email to resend code.', variant: 'error' });
      return;
    }
    try {
      setIsLoading(true);
      await resendVerification(email.trim());
      setStatus({ message: 'Code resent. Check your email.', variant: 'success' });
      setMode('verify');
    } catch (err: any) {
      setStatus({ message: (err as Error)?.message || 'Could not resend code', variant: 'error' });
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
            <h1>Green Generation TV</h1>
            <p className="brand-tagline">Empowering Sustainability Through Conscious Leadership</p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <span className="material-icons">check_circle</span>
              <span>Access exclusive sustainability content</span>
            </div>
            <div className="feature-item">
              <span className="material-icons">check_circle</span>
              <span>Connect with thought leaders</span>
            </div>
            <div className="feature-item">
              <span className="material-icons">check_circle</span>
              <span>Join a community of change-makers</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <h2>{mode === 'register' ? 'Create Account' : mode === 'verify' ? 'Verify Email' : 'Welcome Back'}</h2>
              <p>{mode === 'verify' ? 'Enter the 6-digit code sent to your email' : 'Sign in or create an account'}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="material-icons">mail</span>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode !== 'verify' && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <span className="material-icons">lock</span>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={mode !== 'verify'}
                    />
                  </div>
                </div>
              )}

              {mode === 'verify' && (
                <div className="form-group">
                  <label htmlFor="code">Verification Code</label>
                  <div className="input-wrapper">
                    <span className="material-icons">verified</span>
                    <input
                      type="text"
                      id="code"
                      placeholder="6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                    />
                    <button type="button" className="link-button" onClick={handleResend} disabled={isLoading}>
                      Resend
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="form-actions">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <button type="button" className="link-button" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
              )}

              {status && (
                <div className={`status-banner ${status.variant}`}>
                  <span className="material-icons">
                    {status.variant === 'error' ? 'error_outline' : 'check_circle'}
                  </span>
                  <span>{status.message}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'register'
                  ? 'Send Code'
                  : mode === 'verify'
                  ? 'Verify & Sign In'
                  : 'Sign In'}
              </button>

              <div className="login-footer">
                {mode === 'login' && (
                  <p>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setMode('register')} className="link-button">
                      Create one
                    </button>
                  </p>
                )}
                {mode === 'register' && (
                  <p>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')} className="link-button">
                      Sign in
                    </button>
                  </p>
                )}
                {mode === 'verify' && (
                  <p>
                    Need to change email or password?{' '}
                    <button type="button" onClick={() => setMode('register')} className="link-button">
                      Start over
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="back-home">
            <button onClick={() => onNavigate('home')} className="back-button">
              <span className="material-icons">arrow_back</span>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
