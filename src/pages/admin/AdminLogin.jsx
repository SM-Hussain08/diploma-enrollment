import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { loginAdmin, isAdminLoggedIn } from "../../utils/auth"; // Added isAdminLoggedIn
import ibaLogo from "../../assets/iba-logo.png";
import ceeLogo from "../../assets/cee-logo.png";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  // ADD THIS: Redirect if already logged in
  useEffect(() => {
    if (isAdminLoggedIn()) {
      nav("/admin/dashboard", { replace: true });
    }
  }, [nav]);

  function handleSubmit(e) {
    e.preventDefault();
    const ok = loginAdmin(username.trim(), password);
    if (ok) {
      // CHANGED THIS: replace: true so they can't "back" into login
      nav("/admin/dashboard", { replace: true });
    } else {
      setErr("Invalid username or password.");
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left Side: Branding/Visual */}
        <div className="login-accent-box">
          <div className="accent-content">
            <div className="logo-stack animate-float">
              <img src={ibaLogo} alt="IBA Logo" className="brand-logo" />
              <div className="logo-divider"></div>
              <img src={ceeLogo} alt="CEE Logo" className="brand-logo" />
            </div>
            <div className="branding-text">
              <h2>CEE-Diploma Portal</h2>
              <p>Center for Executive Education</p>
              <span className="portal-badge">ADMINISTRATION</span>
            </div>
          </div>
          <div className="accent-circle-top"></div>
          <div className="accent-circle-bottom"></div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-box">
          <div className="form-header">
            <h3>Welcome Back</h3>
            <p>Enter credentials to access portal</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="input-group">
              <label className="input-label">Username</label>
              <input 
                className="prominent-input"
                type="text"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="admin_id"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                className="prominent-input"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required
              />
            </div>

            {err && (
              <div className="login-alert-danger animate-shake">
                <svg viewBox="0 0 24 24" className="alert-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <span>{err}</span>
              </div>
            )}

            <button className="login-btn-gradient" type="submit">
              Sign In
            </button>
          </form>
          
          <div className="form-footer">
            <p>Developed for IBA Karachi • CEE</p>
          </div>
        </div>
      </div>
    </div>
  );
}