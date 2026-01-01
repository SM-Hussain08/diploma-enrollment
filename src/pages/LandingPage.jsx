import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Management Portal</h1>
        <p>Please select an option to continue</p>
      </header>

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

// Basic inline styles for immediate use
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7f6",
    fontFamily: "sans-serif",
  },
  header: {
    marginBottom: "40px",
    textAlign: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
  },
  button: {
    padding: "15px 40px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    transition: "transform 0.2s",
  },
  enrollBtn: {
    backgroundColor: "#007bff",
    color: "white",
  },
  adminBtn: {
    backgroundColor: "#343a40",
    color: "white",
  },
};

export default LandingPage;