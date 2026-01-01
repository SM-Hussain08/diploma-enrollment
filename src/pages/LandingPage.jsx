import React from "react";
import { useNavigate } from "react-router-dom";
import ceeLogo from "../assets/cee-logo.png";
import ibaLogo from "../assets/iba-logo.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Branding */}
      <div style={styles.logoCard}>
        <img src={ibaLogo} alt="IBA" style={styles.logo} />
        <div style={styles.logoDivider} />
        <img src={ceeLogo} alt="CEE" style={styles.logo} />
      </div>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Management Portal</h1>
        <p style={styles.subtitle}>Please select an option to continue</p>
      </header>

      {/* Actions */}
      <div style={styles.buttonGroup}>
        <button
          style={{ ...styles.button, ...styles.enrollBtn }}
          onClick={() => navigate("/public/enroll")}
        >
          Enroll Now
        </button>

        <button
          style={{ ...styles.button, ...styles.adminBtn }}
          onClick={() => navigate("/admin/login")}
        >
          Admin Control
        </button>
      </div>
    </div>
  );
};

/* ===================== STYLES ===================== */

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)",
    fontFamily: "Inter, sans-serif",
  },

  /* LOGOS */
  logoCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#ffffff",
    padding: "14px 22px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    marginBottom: "28px",
  },
  logo: {
    height: "36px",
    width: "auto",
  },
  logoDivider: {
    width: "1px",
    height: "28px",
    backgroundColor: "#e2e8f0",
  },

  /* HEADER */
  header: {
    marginBottom: "42px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#800000",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#475569",
  },

  /* BUTTONS */
  buttonGroup: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    padding: "16px 42px",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    borderRadius: "12px",
    transition: "all 0.25s ease",
    minWidth: "180px",
  },
  enrollBtn: {
    background: "linear-gradient(135deg, #002147 0%, #003366 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 18px rgba(0,33,71,0.35)",
  },
  adminBtn: {
    background: "linear-gradient(135deg, #800000 0%, #a00000 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 18px rgba(128,0,0,0.35)",
  },
};

export default LandingPage;
