import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PublicForm() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const [enrollmentNature, setEnrollmentNature] = useState(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setConfig(snap.data());
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading enrollment…</p>;
  if (!config) return <p>Enrollment unavailable.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      {!enrollmentNature ? (
        <EnrollmentNatureStep
          question={config.sections.enrollmentNature}
          onSelect={setEnrollmentNature}
        />
      ) : (
        <p>Next steps coming…</p>
      )}
    </div>
  );
}

function EnrollmentNatureStep({ question, onSelect }) {
  return (
    <div>
      <h2>{question.question}</h2>

      {question.options.map((opt) => (
        <button
          key={opt}
          style={btn}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const btn = {
  display: "block",
  padding: "12px",
  marginTop: "10px",
  width: "100%",
};
