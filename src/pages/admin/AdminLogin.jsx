import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../utils/auth";
import ibaLogo from "../../assets/iba-logo.png";
import ceeLogo from "../../assets/cee-logo.png";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const ok = loginAdmin(username.trim(), password);
    if (ok) {
      nav("/admin/dashboard");
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

            {err && <div className="login-error animate-shake">{err}</div>}

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