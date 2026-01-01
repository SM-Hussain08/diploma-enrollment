import { useState, useMemo, useEffect } from "react";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

import EnrollmentNatureStep from "./EnrollmentNatureStep";
import OrganizationInfoStep from "./OrganizationInfoStep";
import ProgramsStep from "./ProgramsStep";
import UserInfoStep from "./UserInfoStep";
import GeneralInfoStep from "./GeneralInfoStep";

import ibaLogo from "../../assets/iba-logo.png";
import ceeLogo from "../../assets/cee-logo.png";

/* ===================== SCALE & UI CONTROL ===================== */
const SCALE_FACTOR = 1; 
const ALERT_SCALE = 0.95; // Specifically control the size of alert modals

const THEME = {
  maroon: "#7a0c0c",
  maroonSoft: "#fef2f2",
  blue: "#0b3c5d",
  blueSoft: "#eef6fb",
  textMain: "#1f2937",
  textMuted: "#6b7280",
  white: "#ffffff",
  gradient: "linear-gradient(135deg, #7a0c0c 0%, #0b3c5d 100%)",
};

// ===================== GLOBAL DIMENSION CONTROLS =====================
const WIDTH_SCALE = 0.8;   // Controls horizontal sizing
const HEIGHT_SCALE = 0.8;  // Controls vertical sizing

const w = (v) => `${v * WIDTH_SCALE}px`;
const h = (v) => `${v * HEIGHT_SCALE}px`;
const wh = (vw, vh = vw) => `${vw * WIDTH_SCALE}px ${vh * HEIGHT_SCALE}px`;


const SIZES = {
  title: 22 * SCALE_FACTOR,
  body: 15 * SCALE_FACTOR,
  meta: 13 * SCALE_FACTOR,
  button: 16 * SCALE_FACTOR,
  logoHeight: 38 * SCALE_FACTOR,
};

export default function PublicEnrollment() {
  const [stepIndex, setStepIndex] = useState(0);
  const [participantIndex, setParticipantIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [direction, setDirection] = useState("forward");
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  const [config, setConfig] = useState({ openingMessage: "", closingMessage: "" });
  const [enrollmentData, setEnrollmentData] = useState({
    enrollmentNature: null,
    organizationInfo: {},
    participants: [],
    generalInfo: {},
  });

  /* ===================== FETCH CONFIG ===================== */
  useEffect(() => {
    async function fetchMessages() {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        const d = snap.data();
        setConfig({
          openingMessage: d.openingMessage || "Welcome to the CEE Enrollment Portal",
          closingMessage: d.closingMessage || "Your enrollment has been received successfully.",
        });
      }
    }
    fetchMessages();
  }, []);

  /* ===================== SPLASH TRANSITION ===================== */
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  /* ===================== FLOW LOGIC ===================== */
  const steps = useMemo(() => {
    const flow = ["INTRO", "ENROLLMENT_NATURE"];
    if (enrollmentData.enrollmentNature === "Organization Sponsored") {
      flow.push("ORGANIZATION_INFO");
    }
    flow.push("PROGRAMS", "USER_INFO", "GENERAL_INFO", "SUCCESS");
    return flow;
  }, [enrollmentData.enrollmentNature]);

  const currentStep = steps[stepIndex];
  const isOrganization = enrollmentData.enrollmentNature === "Organization Sponsored";
  const totalParticipants = isOrganization ? (Number(enrollmentData.organizationInfo?.participantCount) || 1) : 1;

  /* ===================== LOOP-AWARE PROGRESS BAR ===================== */
  const progressItems = useMemo(() => {
    const items = [{ id: "ENROLLMENT_NATURE", label: "Nature" }];
    if (isOrganization) items.push({ id: "ORGANIZATION_INFO", label: "Organization" });
    
    // For participants, we create a unified block in the list
    if (isOrganization) {
      items.push({ id: "PARTICIPANT_LOOP", label: `Participant Details (${participantIndex + 1}/${totalParticipants})` });
    } else {
      items.push({ id: "PROGRAMS", label: "Program Selection" });
      items.push({ id: "USER_INFO", label: "Personal Details" });
    }
    items.push({ id: "GENERAL_INFO", label: "General Information" });
    return items;
  }, [isOrganization, totalParticipants, participantIndex]);

  // Determine current active index in the progress bar
  const activeProgIdx = useMemo(() => {
    if (currentStep === "ENROLLMENT_NATURE") return 0;
    if (currentStep === "ORGANIZATION_INFO") return 1;
    if (currentStep === "PROGRAMS" || currentStep === "USER_INFO") return isOrganization ? 2 : (currentStep === "PROGRAMS" ? 1 : 2);
    if (currentStep === "GENERAL_INFO") return isOrganization ? 3 : 3;
    return 0;
  }, [currentStep, isOrganization]);

  const progressPercent = ((activeProgIdx + 1) / progressItems.length) * 100;

  /* ===================== NAVIGATION ===================== */
  const next = () => {
    setDirection("forward");
    if (isOrganization && currentStep === "ORGANIZATION_INFO") {
      setShowConfirmation(true);
      return;
    }
    if (isOrganization && currentStep === "USER_INFO" && participantIndex < totalParticipants - 1) {
      setParticipantIndex(i => i + 1);
      setStepIndex(steps.indexOf("PROGRAMS"));
      return;
    }
    if (currentStep === "GENERAL_INFO") {
      handleSubmit();
      return;
    }
    setStepIndex(i => Math.min(i + 1, steps.length - 1));
  };

  const back = () => {
    setDirection("back");
    // If on Enrollment Nature, go back to Intro
    if (currentStep === "ENROLLMENT_NATURE") {
      setStepIndex(0);
      return;
    }
    // Warning when leaving data-heavy sections back to Nature selection
    if (steps[stepIndex - 1] === "ENROLLMENT_NATURE") {
      setShowBackWarning(true);
      return;
    }
    // Reverse Loop Logic
    if (isOrganization && currentStep === "PROGRAMS" && participantIndex > 0) {
      setParticipantIndex(i => i - 1);
      setStepIndex(steps.indexOf("USER_INFO"));
      return;
    }
    setStepIndex(i => Math.max(i - 1, 0));
  };

  const handleReset = () => {
    setEnrollmentData({ enrollmentNature: null, organizationInfo: {}, participants: [], generalInfo: {} });
    setParticipantIndex(0);
    setStepIndex(steps.indexOf("ENROLLMENT_NATURE"));
    setShowBackWarning(false);
  };

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "enrollments"), { ...enrollmentData, submittedAt: serverTimestamp(), status: "pending" });
      setStepIndex(steps.indexOf("SUCCESS"));
    } catch { alert("Submission error."); } finally { setIsSubmitting(false); }
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      {/* ENHANCED SPLASH SEQUENCE */}
      {showSplash && (
        <div style={styles.splash}>
          <div className="splash-content" style={styles.splashContent}>
             <div style={styles.splashLogoRow}>
                <img src={ibaLogo} alt="IBA" style={styles.splashLogo} className="logo-pop-1" />
                <div style={styles.splashDivider} className="divider-grow" />
                <img src={ceeLogo} alt="CEE" style={styles.splashLogo} className="logo-pop-2" />
             </div>
             <div className="loader-line" style={styles.splashLoader} />
          </div>
        </div>
      )}

      {!showSplash && (
        <div style={styles.shell}>
          <header style={styles.header}>
            <div style={styles.logoRow}>
              <img src={ibaLogo} alt="IBA" style={styles.logo} />
              <span style={styles.divider} />
              <img src={ceeLogo} alt="CEE" style={styles.logo} />
            </div>
          </header>

          {/* DYNAMIC PROGRESS ACCORDION */}
          {currentStep !== "INTRO" && currentStep !== "SUCCESS" && (
            <div style={styles.progressShell}>
              <div style={styles.progressHeader} onClick={() => setShowProgressDetails(!showProgressDetails)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={styles.stepBadge}>{activeProgIdx + 1}</div>
                   <span style={styles.activeLabel}>{progressItems[activeProgIdx]?.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <span style={styles.percentText}>{Math.round(progressPercent)}%</span>
                   <span style={{ transform: showProgressDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
                </div>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
              </div>

              {showProgressDetails && (
                <div style={styles.progressDropdown}>
                  {progressItems.map((item, i) => (
                    <div key={item.id} style={{ ...styles.dropItem, opacity: i > activeProgIdx ? 0.5 : 1 }}>
                      <div style={{ ...styles.dropDot, backgroundColor: i <= activeProgIdx ? THEME.maroon : '#cbd5e1' }}>
                         {i < activeProgIdx && "✓"}
                      </div>
                      <span style={{ fontWeight: i === activeProgIdx ? 700 : 400 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <main key={currentStep + participantIndex} className={direction === "forward" ? "slideIn" : "slideBack"} style={styles.card}>
            {isSubmitting ? (
              <div style={styles.loadingArea}><div className="spinner" /><p>Finalizing Enrollment...</p></div>
            ) : (
              <>
                {currentStep === "INTRO" && (
                  <div style={{ textAlign: 'center', animation: 'fadeIn 1s ease' }}>
                    <h2 style={styles.title}>CEE Enrollment Portal</h2>
                    <p style={styles.introText}>{config.openingMessage}</p>
                    <button style={styles.primaryBtn} onClick={next}>Get Started</button>
                  </div>
                )}

                {currentStep === "ENROLLMENT_NATURE" && (
                   <>
                    <EnrollmentNatureStep enrollmentData={enrollmentData} setEnrollmentData={setEnrollmentData} onNext={next} />
                    <button onClick={back} style={styles.textBackBtn}>← Back to Welcome</button>
                   </>
                )}

                {currentStep === "ORGANIZATION_INFO" && <OrganizationInfoStep enrollmentData={enrollmentData} setEnrollmentData={setEnrollmentData} onNext={next} onBack={back} />}
                {currentStep === "PROGRAMS" && <ProgramsStep enrollmentData={enrollmentData} participantIndex={participantIndex} setEnrollmentData={setEnrollmentData} onNext={next} onBack={back} />}
                {currentStep === "USER_INFO" && <UserInfoStep enrollmentData={enrollmentData} participantIndex={participantIndex} setEnrollmentData={setEnrollmentData} onNext={next} onBack={back} />}
                {currentStep === "GENERAL_INFO" && <GeneralInfoStep enrollmentData={enrollmentData} setEnrollmentData={setEnrollmentData} onNext={next} onBack={back} />}

                {currentStep === "SUCCESS" && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={styles.successBadge}>✓</div>
                    <h2 style={styles.title}>Thank You!</h2>
                    <p style={styles.introText}>{config.closingMessage}</p>
                    <button style={styles.primaryBtn} onClick={() => window.location.reload()}>Return Home</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* SCALED CUSTOM ALERTS */}
      {(showConfirmation || showBackWarning) && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, transform: `scale(${ALERT_SCALE})` }}>
            <div style={{ ...styles.modalIcon, backgroundColor: showBackWarning ? '#fff1f2' : THEME.blueSoft, color: showBackWarning ? THEME.maroon : THEME.blue }}>
              {showBackWarning ? '!' : 'i'}
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: THEME.blue }}>{showBackWarning ? "Reset Progress?" : "Participant Confirmation"}</h3>
            <p style={{ color: THEME.textMuted, fontSize: SIZES.body, lineHeight: 1.5 }}>
              {showBackWarning 
                ? "Switching enrollment types will erase all current entries. Are you sure you want to start over?"
                : `You are enrolling ${totalParticipants} participants. You will be asked to provide details for each one sequentially.`}
            </p>
            <div style={styles.modalBtnRow}>
              <button style={styles.modalCancel} onClick={() => { setShowConfirmation(false); setShowBackWarning(false); }}>Cancel</button>
              <button 
                style={{ ...styles.modalAction, backgroundColor: showBackWarning ? THEME.maroon : THEME.blue }} 
                onClick={showBackWarning ? handleReset : () => { setShowConfirmation(false); setStepIndex(stepIndex + 1); }}
              >
                {showBackWarning ? "Yes, Reset" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: THEME.gradient,
    fontFamily: "'Inter', sans-serif",
  },

  shell: {
    maxWidth: w(660),
    margin: "0 auto",
    padding: wh(15),
  },

  header: {
    display: "flex",
    justifyContent: "center",
    marginBottom: h(25),
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: wh(25, 10),
    borderRadius: w(50),
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    gap: w(15),
  },

  logo: {
    height: h(SIZES.logoHeight),
  },

  divider: {
    width: w(1),
    height: h(25),
    background: "#e2e8f0",
  },

  /* Progress Accordion */
  progressShell: {
    background: "#fff",
    borderRadius: w(24),
    padding: wh(24, 18),
    marginBottom: h(15),
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepBadge: {
    background: THEME.blue,
    color: "#fff",
    width: w(24),
    height: h(24),
    borderRadius: w(8),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
  },

  activeLabel: {
    fontWeight: 700,
    color: THEME.blue,
    fontSize: SIZES.body,
  },

  percentText: {
    color: THEME.maroon,
    fontWeight: 800,
    fontSize: 14,
  },

  progressTrack: {
    height: h(6),
    background: "#f1f5f9",
    borderRadius: w(10),
    overflow: "hidden",
    marginTop: h(15),
  },

  progressFill: {
    height: "100%",
    background: THEME.gradient,
    transition: "width .6s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  progressDropdown: {
    marginTop: h(20),
    paddingTop: h(15),
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: h(14),
  },

  dropItem: {
    display: "flex",
    alignItems: "center",
    gap: w(12),
    fontSize: 14,
    color: THEME.textMain,
  },

  dropDot: {
    width: w(20),
    height: h(20),
    borderRadius: "50%",
    color: "#fff",
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Card Styles */
  card: {
    background: "#fff",
    borderRadius: w(30),
    padding: wh(35),
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  },

  title: {
    fontSize: SIZES.title,
    fontWeight: 800,
    color: THEME.blue,
    marginBottom: h(15),
  },

  introText: {
    fontSize: SIZES.body,
    color: THEME.textMuted,
    lineHeight: 1.6,
    marginBottom: h(30),
  },

  primaryBtn: {
    width: "100%",
    padding: h(18),
    background: THEME.gradient,
    color: "#fff",
    borderRadius: w(14),
    fontWeight: 700,
    fontSize: SIZES.button,
    border: "none",
    cursor: "pointer",
  },

  textBackBtn: {
    background: "none",
    border: "none",
    color: THEME.muted,
    cursor: "pointer",
    marginTop: h(20),
    fontSize: 13,
    fontWeight: 500,
  },

  /* Modal Styles */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(11, 60, 93, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#fff",
    padding: wh(35),
    borderRadius: w(32),
    maxWidth: w(400),
    width: "90%",
    textAlign: "center",
    boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
  },

  modalIcon: {
    width: w(55),
    height: h(55),
    borderRadius: w(18),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: `0 auto ${h(15)}`,
    fontSize: 24,
    fontWeight: 900,
  },

  modalBtnRow: {
    display: "flex",
    gap: w(12),
    marginTop: h(30),
  },

  modalCancel: {
    flex: 1,
    padding: h(16),
    background: "#f1f5f9",
    color: THEME.textMain,
    border: "none",
    borderRadius: w(14),
    fontWeight: 700,
    cursor: "pointer",
  },

  modalAction: {
    flex: 1.5,
    padding: h(16),
    color: "#fff",
    border: "none",
    borderRadius: w(14),
    fontWeight: 700,
    cursor: "pointer",
  },

  /* Splash Styles */
  splash: {
    position: "fixed",
    inset: 0,
    background: THEME.gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },

  splashContent: { textAlign: "center" },

  splashLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: w(30),
    background: "#fff",
    padding: wh(50, 30),
    borderRadius: w(100),
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },

  splashLogo: { height: h(75) },

  splashDivider: {
    width: w(2),
    height: h(50),
    background: "#e2e8f0",
  },

  splashLoader: {
    height: h(4),
    width: w(100),
    background: "rgba(255,255,255,0.3)",
    margin: `${h(30)} auto`,
    borderRadius: w(10),
    overflow: "hidden",
  },

  loadingArea: {
    padding: `${h(60)} 0`,
    textAlign: "center",
  },

  successBadge: {
    width: w(70),
    height: h(70),
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    fontSize: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: `0 auto ${h(20)}`,
  },
};

const globalCSS = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .logo-pop-1 { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .logo-pop-2 { animation: pop 0.6s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
  .divider-grow { animation: grow 0.5s 0.2s ease both; }
  .loader-line::after { content: ""; display: block; height: 100%; width: 50%; background: #fff; animation: loading 1.5s infinite ease-in-out; }
  
  @keyframes pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes grow { from { height: 0; } to { height: 50px; } }
  @keyframes loading { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
  
  .slideIn { animation: slideIn 0.4s ease-out; }
  .slideBack { animation: slideBack 0.4s ease-out; }
  @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideBack { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  
  .spinner { width: 45px; height: 45px; border: 4px solid ${THEME.blueSoft}; border-top-color: ${THEME.maroon}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;