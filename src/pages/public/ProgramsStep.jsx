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


export default function ProgramsStep({ enrollmentData, participantIndex, setEnrollmentData, onNext, onBack }) {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ===================== LOAD EXISTING DATA ===================== */
  useEffect(() => {
    const existing = enrollmentData.participants?.[participantIndex]?.program || "";
    setSelected(existing);
    setHasSubmitted(false);
  }, [participantIndex, enrollmentData.participants]);

  /* ===================== LOAD PROGRAMS ===================== */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setPrograms(snap.data().sections?.programs?.list || []);
      }
    }
    load();
  }, []);

  function proceed() {
    setHasSubmitted(true);
    if (!selected) return;

    const newParts = [...(enrollmentData.participants || [])];
    newParts[participantIndex] = { ...newParts[participantIndex], program: selected };
    
    setEnrollmentData({ ...enrollmentData, participants: newParts });
    onNext();
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Select Program</h2>
        <div style={styles.badge}>Diplomas</div>
      </header>

      <p style={styles.subtitle}>
        Choose the specialized track for Participant #{participantIndex + 1}.
      </p>

      {/* VALIDATION ALERT */}
      {hasSubmitted && !selected && (
        <div style={styles.errorAlert}>
          Please select a program to continue.
        </div>
      )}

      {/* PROGRAM SELECTION LIST */}
      <div style={styles.scrollArea}>
        {programs.map((p) => {
          const isActive = selected === p;
          return (
            <div 
              key={p} 
              onClick={() => setSelected(p)} 
              className="program-card"
              style={{
                ...styles.programCard,
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
                ...styles.programText, 
                color: isActive ? COLORS.maroon : COLORS.text 
              }}>
                {p}
              </span>
            </div>
          );
        })}
      </div>

      {/* NAVIGATION */}
      <div style={styles.btnRow}>
        <button onClick={onBack} style={styles.backBtn}>
          Back
        </button>

        <button onClick={proceed} style={styles.nextBtn}>
          Continue
        </button>
      </div>

      <style>{`
        .program-card { 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          cursor: pointer; 
        }
        .program-card:hover { 
          border-color: ${COLORS.maroon}; 
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

  scrollArea: {
    maxHeight: s(450),
    overflowY: "auto",
    padding: s(4),
    display: "flex",
    flexDirection: "column",
    gap: s(12),
  },

  programCard: {
    display: "flex",
    alignItems: "center",
    padding: s(20),
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

  programText: {
    fontSize: s(16),
    fontWeight: 600,
  },

  btnRow: {
    display: "flex",
    gap: s(16),
    marginTop: s(28),
    borderTop: "1px solid #e2e8f0",
    paddingTop: s(24),
  },

  nextBtn: {
    flex: 2,
    background: `linear-gradient(135deg, ${COLORS.maroon} 0%, #4d0000 100%)`,
    color: "white",
    padding: s(16),
    borderRadius: s(12),
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(122, 12, 12, 0.2)",
  },

  backBtn: {
    flex: 1,
    background: "white",
    color: COLORS.blue,
    border: `2px solid ${COLORS.blue}`,
    padding: s(16),
    borderRadius: s(12),
    fontWeight: 600,
    cursor: "pointer",
  },
};
