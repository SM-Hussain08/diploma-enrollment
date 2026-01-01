import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import QuestionRenderer from "../../components/public/QuestionRenderer";

/* ===================== THEME CONSTANTS ===================== */
const COLORS = {
  maroon: "#7a0c0c",
  blue: "#0b3c5d",
  text: "#1f2937",
  muted: "#64748b",
  error: "#dc2626",
  white: "#ffffff",
};

const UI_SCALE = 0.7;
const s = (v) => `${v * UI_SCALE}px`;
const n = (v) => v * UI_SCALE;


export default function OrganizationInfoStep({ enrollmentData, setEnrollmentData, onNext, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(enrollmentData.organizationInfo || {});
  const [participantCount, setParticipantCount] = useState(enrollmentData.organizationInfo?.participantCount || 1);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ===================== LOAD QUESTIONS ===================== */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setQuestions(snap.data().sections?.organizationInfo?.questions || []);
      }
    }
    load();
  }, []);

  const update = (id, value) => setAnswers({ ...answers, [id]: value });

  /* ===================== VALIDATION ===================== */
  const getMissingFields = () => {
    const missing = questions.filter(q => q.required && !q.immutable && !answers[q.id]);
    if (!participantCount || participantCount < 1) {
      missing.push({ id: 'participantCount', label: 'Participant Count' });
    }
    return missing;
  };

  function proceed() {
    setHasSubmitted(true);
    
    const missing = getMissingFields();
    if (missing.length > 0) {
      const firstId = missing[0].id === 'participantCount' ? 'count-card' : `scroll-target-${missing[0].id}`;
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setEnrollmentData({ 
      ...enrollmentData, 
      organizationInfo: { ...answers, participantCount } 
    });
    onNext();
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Organization Details</h2>
        <div style={styles.badge}>Sponsorship</div>
      </header>

      <p style={styles.subtitle}>
        Please provide your organization's sponsorship information and participant count.
      </p>

      {/* VALIDATION ALERT */}
      {hasSubmitted && getMissingFields().length > 0 && (
        <div style={styles.errorAlert}>
          Please fill in all required organization details.
        </div>
      )}

      <div style={styles.scrollArea}>
        {/* DYNAMIC QUESTIONS */}
        {questions.filter(q => !q.immutable).map((q) => (
          <div key={q.id} id={`scroll-target-${q.id}`}>
            <QuestionRenderer
              question={q}
              value={answers[q.id]}
              onChange={(val) => update(q.id, val)}
              highlightEmpty={hasSubmitted}
            />
          </div>
        ))}

        {/* FIXED LOGIC FIELD: PARTICIPANT COUNT */}
        <div 
          id="count-card"
          style={{
            ...styles.fixedFieldCard,
            borderColor: hasSubmitted && (!participantCount || participantCount < 1) ? COLORS.error : "#e5e7eb",
            backgroundColor: hasSubmitted && (!participantCount || participantCount < 1) ? "#fffafa" : COLORS.white
          }}
        >
          <label style={styles.fixedLabel}>
            How many participants are you enrolling? <span style={{color: COLORS.maroon}}>*</span>
          </label>
          <input 
            type="number" 
            min={1} 
            value={participantCount} 
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            style={styles.numberInput}
          />
          <p style={styles.helperText}>This determines how many info forms you will fill in the next steps.</p>
        </div>
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
    maxHeight: s(480),
    overflowY: "auto",
    paddingRight: s(8),
  },

  fixedFieldCard: {
    padding: s(20),
    borderRadius: s(12),
    border: "1px solid",
    transition: "all 0.3s ease",
    marginBottom: s(20),
  },

  fixedLabel: {
    fontWeight: 600,
    color: COLORS.text,
    display: "block",
    marginBottom: s(12),
    fontSize: s(15),
  },

  numberInput: {
    width: "100%",
    padding: `${s(12)} ${s(16)}`,
    borderRadius: s(8),
    border: `1.5px solid #e5e7eb`,
    fontSize: s(16),
    outline: "none",
    boxSizing: "border-box",
  },

  helperText: {
    fontSize: s(12),
    color: COLORS.muted,
    marginTop: s(8),
  },

  btnRow: {
    display: "flex",
    gap: s(16),
    marginTop: s(24),
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
