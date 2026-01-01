import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current values in inputs
  const [openingMessage, setOpeningMessage] = useState("");
  const [closingMessage, setClosingMessage] = useState("");

  // Original values from DB to track "dirty" state
  const [originalOpening, setOriginalOpening] = useState("");
  const [originalClosing, setOriginalClosing] = useState("");

  const [isSavingOpening, setIsSavingOpening] = useState(false);
  const [isSavingClosing, setIsSavingClosing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "formConfig", "mainConfig");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setConfig(data);
          // Set both current and original states
          setOpeningMessage(data.openingMessage || "");
          setOriginalOpening(data.openingMessage || "");
          setClosingMessage(data.closingMessage || "");
          setOriginalClosing(data.closingMessage || "");
        }
      } catch (err) { console.error("❌ Firestore error:", err); }
      setLoading(false);
    }
    load();
  }, []);

  async function saveOpening() {
    setIsSavingOpening(true);
    try {
      const ref = doc(db, "formConfig", "mainConfig");
      await updateDoc(ref, { openingMessage });
      setOriginalOpening(openingMessage); // Update original to match new saved state
    } catch (err) { alert("Error saving opening message"); }
    finally { setIsSavingOpening(false); }
  }

  async function saveClosing() {
    setIsSavingClosing(true);
    try {
      const ref = doc(db, "formConfig", "mainConfig");
      await updateDoc(ref, { closingMessage });
      setOriginalClosing(closingMessage); // Update original to match new saved state
    } catch (err) { alert("Error saving closing message"); }
    finally { setIsSavingClosing(false); }
  }

  if (loading) return (
    <div className="premium-loader-screen">
      <div className="orbit-spinner"></div>
      <p>Configuring Environment...</p>
    </div>
  );

  // Logic to check if text has been modified
  const isOpeningDirty = openingMessage !== originalOpening;
  const isClosingDirty = closingMessage !== originalClosing;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-hero-mini">
        <div className="hero-accent-bar"></div>
        <div className="hero-content">
          <h1>Workspace Control</h1>
          <p>Manage core enrollment logic and messaging.</p>
        </div>
      </header>

      <div className="dashboard-grid-compact">
        
        {/* ENROLLMENT NATURE - Compact Dark Card */}
        <section className="logic-core-card-slim">
          <div className="logic-badge-mini">System Core</div>
          <h3>Enrollment Nature</h3>
          
          <div className="mini-input-group">
            <label>Form Label</label>
            <div className="static-display-box">{config.sections.enrollmentNature.question}</div>
          </div>

          <div className="options-sim-slim">
            <label>Input Preview</label>
            <div className="radio-list">
              {config.sections.enrollmentNature.options.map((o) => (
                <div key={o} className="radio-row">
                  <div className="radio-dot-outer"><div className="radio-dot-inner"></div></div>
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lock-footer">Read-only Configuration</div>
        </section>

        {/* MESSAGING - Compact Stack */}
        <div className="messaging-stack-slim">
          {/* Opening Message */}
          <section className={`editor-card-compact ${isOpeningDirty ? 'is-dirty' : ''}`}>
            <div className="editor-head-slim">
              <span className="icon-sm">💬</span>
              <div>
                <h4>Welcome Sequence</h4>
                <p>Initial landing text</p>
              </div>
            </div>
            
            <textarea
              className="compact-textarea"
              value={openingMessage}
              onChange={(e) => setOpeningMessage(e.target.value)}
              rows={3}
            />
            
            <button 
              className="sync-btn-sm" 
              onClick={saveOpening} 
              disabled={!isOpeningDirty || isSavingOpening}
            >
              {isSavingOpening ? (
                <span className="btn-loading-flex">
                  <span className="mini-spin"></span> Saving...
                </span>
              ) : isOpeningDirty ? "Confirm Changes" : "Up to Date"}
            </button>
          </section>

          {/* Closing Message */}
          <section className={`editor-card-compact ${isClosingDirty ? 'is-dirty' : ''}`}>
            <div className="editor-head-slim">
              <span className="icon-sm">✅</span>
              <div>
                <h4>Outgoing Message</h4>
                <p>Final submission text</p>
              </div>
            </div>
            
            <textarea
              className="compact-textarea"
              value={closingMessage}
              onChange={(e) => setClosingMessage(e.target.value)}
              rows={3}
            />
            
            <button 
              className="sync-btn-sm" 
              onClick={saveClosing} 
              disabled={!isClosingDirty || isSavingClosing}
            >
              {isSavingClosing ? (
                <span className="btn-loading-flex">
                  <span className="mini-spin"></span> Saving...
                </span>
              ) : isClosingDirty ? "Confirm Changes" : "Up to Date"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}