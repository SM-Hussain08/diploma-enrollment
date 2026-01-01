import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

/* ===================== THEME CONSTANTS ===================== */
const COLORS = {
  maroon: "#7a0c0c",
  maroonSoft: "#fef2f2",
  blue: "#0b3c5d",
  text: "#1f2937",
  muted: "#64748b",
  error: "#dc2626",
  white: "#ffffff",
  border: "#e5e7eb"
};

const UI_SCALE = 0.7;
const s = (v) => `${v * UI_SCALE}px`;
const n = (v) => v * UI_SCALE;


export default function EnrollmentNatureStep({ enrollmentData, setEnrollmentData, onNext }) {
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState(enrollmentData.enrollmentNature || "");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ===================== LOAD CONFIG ===================== */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setConfig(snap.data().sections?.enrollmentNature);
      }
    }
    load();
  }, []);

  function proceed() {
    setHasSubmitted(true);
    if (!selected) return;

    setEnrollmentData({ ...enrollmentData, enrollmentNature: selected });
    onNext();
  }

  if (!config) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner"></div>
        <p style={{ marginTop: 15, fontWeight: 500 }}>Loading enrollment options...</p>
        <style>{`
          .spinner { width: 40px; height: 40px; border: 4px solid ${COLORS.maroonSoft}; border-top: 4px solid ${COLORS.maroon}; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>{"Enrollment Nature"}</h2>
        <div style={styles.badge}>Step 1</div>
      </header>

      <p style={styles.subtitle}>
        {config.question}
      </p>

      {/* VALIDATION ALERT */}
      {hasSubmitted && !selected && (
        <div style={styles.errorAlert}>
          Please select an enrollment type to continue.
        </div>
      )}

      {/* OPTIONS LIST */}
      <div style={styles.optionsList}>
        {config.options.map((opt) => {
          const isActive = selected === opt;
          return (
            <div 
              key={opt} 
              onClick={() => setSelected(opt)} 
              className="nature-card"
              style={{
                ...styles.optionCard,
                borderColor: isActive ? COLORS.maroon : COLORS.border,
                backgroundColor: isActive ? COLORS.maroonSoft : COLORS.white,
                boxShadow: isActive ? "0 4px 12px rgba(122, 12, 12, 0.1)" : "none"
              }}
            >
              <div style={{
                ...styles.radioCircle,
                borderColor: isActive ? COLORS.maroon : "#cbd5e1",
                backgroundColor: isActive ? COLORS.maroon : "transparent"
              }}>
                {isActive && <div style={styles.innerDot} />}
              </div>
              
              <span style={{ 
                ...styles.optionText, 
                color: isActive ? COLORS.maroon : COLORS.blue 
              }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      <button onClick={proceed} style={styles.submitBtn}>
        <span>Get Started</span>
        <span style={{ marginLeft: 8 }}>→</span>
      </button>

      <style>{`
        .nature-card { 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          cursor: pointer; 
        }
        .nature-card:hover { 
          border-color: ${COLORS.maroon}; 
          background-color: ${COLORS.white};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  container: {
    maxWidth: s(650),
    margin: "0 auto",
  },

  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: s(300),
    color: COLORS.maroon,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: s(8),
  },

  title: {
    fontSize: s(22),
    color: COLORS.blue,
    margin: 0,
    fontWeight: 700,
    lineHeight: n(1.3),
  },

  badge: {
    backgroundColor: COLORS.blue,
    color: "white",
    fontSize: s(11),
    padding: `${s(4)} ${s(12)}`,
    borderRadius: s(20),
    fontWeight: 600,
    textTransform: "uppercase",
  },

  subtitle: {
    color: COLORS.muted,
    marginBottom: s(24),
    fontSize: s(15),
  },

  errorAlert: {
    backgroundColor: "#fef2f2",
    color: COLORS.error,
    padding: `${s(12)} ${s(16)}`,
    borderRadius: s(8),
    marginBottom: s(20),
    fontSize: s(14),
    fontWeight: 500,
    border: `1px solid ${COLORS.error}`,
  },

  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: s(14),
    marginBottom: s(24),
  },

  optionCard: {
    display: "flex",
    alignItems: "center",
    padding: s(22),
    borderRadius: s(14),
    border: "2px solid",
  },

  radioCircle: {
    width: s(22),
    height: s(22),
    borderRadius: "50%",
    border: "2px solid",
    marginRight: s(16),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  innerDot: {
    width: s(8),
    height: s(8),
    borderRadius: "50%",
    background: "white",
  },

  optionText: {
    fontSize: s(16),
    fontWeight: 600,
  },

  submitBtn: {
    width: "100%",
    background: `linear-gradient(135deg, ${COLORS.maroon} 0%, #4d0000 100%)`,
    color: "white",
    padding: s(18),
    borderRadius: s(12),
    fontWeight: 600,
    fontSize: s(16),
    border: "none",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 8px 20px rgba(122, 12, 12, 0.2)",
    marginTop: s(10),
  },
};
