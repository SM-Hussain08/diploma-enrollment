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


export default function GeneralInfoStep({ enrollmentData, setEnrollmentData, onNext, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(enrollmentData.generalInfo || {});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ===================== LOAD QUESTIONS ===================== */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setQuestions(snap.data().sections?.generalInfo?.questions || []);
      }
    }
    load();
  }, []);

  const update = (id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  /* ===================== VALIDATION ===================== */
  const getMissingFields = () => {
    return questions.filter(q => q.required && (!answers[q.id] || answers[q.id] === ""));
  };

  function proceed() {
    setHasSubmitted(true);

    const missing = getMissingFields();
    if (missing.length > 0) {
      const firstMissing = document.getElementById(`scroll-target-${missing[0].id}`);
      if (firstMissing) {
        firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setEnrollmentData({ ...enrollmentData, generalInfo: answers });
    onNext(); 
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Final Information</h2>
        <div style={styles.badge}>Final Step</div>
      </header>

      <p style={styles.subtitle}>
        Almost there! Please answer these final questions to complete your enrollment.
      </p>

      {/* VALIDATION ALERT */}
      {hasSubmitted && getMissingFields().length > 0 && (
        <div style={styles.errorAlert}>
          Please complete the required final details highlighted below.
        </div>
      )}

      {/* QUESTIONS AREA */}
      <div style={styles.scrollArea}>
        {questions.map((q) => (
          <div key={q.id} id={`scroll-target-${q.id}`}>
            <QuestionRenderer
              question={q}
              value={answers[q.id]}
              onChange={(val) => update(q.id, val)}
              highlightEmpty={hasSubmitted}
            />
          </div>
        ))}
      </div>

      {/* NAVIGATION */}
      <div style={styles.btnRow}>
        <button onClick={onBack} style={styles.backBtn}>
          Back
        </button>

        <button onClick={proceed} style={styles.submitBtn}>
          Complete Enrollment
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
    backgroundColor: COLORS.maroon, // Maroon to signify "Final"
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
    marginBottom: s(10),
  },

  btnRow: {
    display: "flex",
    gap: s(16),
    marginTop: s(24),
    borderTop: "1px solid #e2e8f0",
    paddingTop: s(24),
  },

  submitBtn: {
    flex: 2,
    background: `linear-gradient(135deg, ${COLORS.blue} 0%, #000a14 100%)`,
    color: "white",
    padding: s(16),
    borderRadius: s(12),
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(11, 60, 93, 0.3)",
    transition: "all 0.2s ease",
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
