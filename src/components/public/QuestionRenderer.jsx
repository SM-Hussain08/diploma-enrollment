import React, { useState, useRef, useEffect } from "react";

/* ===================== THEME ===================== */
const THEME = {
  maroon: "#7a0c0c",
  maroonSoft: "#fef2f2",
  blue: "#0b3c5d",
  blueSoft: "#eef6fb",
  border: "#e5e7eb",
  text: "#1f2937",
  muted: "#6b7280",
  error: "#dc2626",
  white: "#ffffff",
};

// ===================== DIMENSION CONTROLS =====================
const WIDTH_SCALE = 1.1;
const HEIGHT_SCALE = 1.1;

const w = (v) => `${v * WIDTH_SCALE}px`;
const h = (v) => `${v * HEIGHT_SCALE}px`;
const wh = (vw, vh = vw) => `${vw * WIDTH_SCALE}px ${vh * HEIGHT_SCALE}px`;

const SCALE = {
  card: 1.0,
  label: 0.8,
  input: 0.6,
  option: 0.5,     // Controls the MCQ/Checkbox box size (padding/font)
  selection: 0.8,  // Controls the actual Radio/Checkbox circle/square size
  button: 0.7,     // Controls the File Upload button size
};

export default function QuestionRenderer({ question, value, onChange, error, highlightEmpty }) {
  const { id, label, type, required, options = [], fileConfig } = question;
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState("");
  const textareaRef = useRef(null);

  // 1. AUTO-EXPANDING TEXTAREA LOGIC
  useEffect(() => {
    if (type === "longText" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Limit height to 200px before scrolling kicks in
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = nextHeight + "px";
    }
  }, [value, type]);

  const handleValueChange = (val) => {
    let errorMsg = "";
    if (type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) errorMsg = "Please enter a valid email address.";
    }
    if (type === "number" && val) {
      if (isNaN(val)) errorMsg = "Please enter a valid number.";
    }
    setLocalError(errorMsg);
    onChange(val);
  };

  const showWarning = (highlightEmpty && required && !value) || error || localError;

  const getBaseInputStyle = (isFocused) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: `${12 * SCALE.input}px 16px`,
    borderRadius: 8,
    border: `2px solid ${showWarning ? THEME.error : (isFocused ? THEME.blue : THEME.border)}`,
    fontSize: 15 * SCALE.input,
    outline: "none",
    backgroundColor: THEME.white,
    color: THEME.text,
    transition: "all 0.2s ease",
    boxShadow: isFocused ? `0 0 0 3px ${THEME.blueSoft}` : "none",
    // Force light scheme for the calendar/picker
    colorScheme: "light", 
  });

  function renderInput() {
    switch (type) {
      case "shortText":
      case "email":
      case "number":
        return (
          <input
            type={type === "shortText" ? "text" : type}
            value={value || ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => handleValueChange(e.target.value)}
            style={getBaseInputStyle(isFocused)}
          />
        );

      case "date":
        return (
          <div style={{ position: "relative" }}>
            <input
              type="date"
              value={value || ""}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => handleValueChange(e.target.value)}
              style={{
                ...getBaseInputStyle(isFocused),
                cursor: "text",
                position: "relative",
              }}
            />
            <style>{`
              input[type="date"]::-webkit-calendar-picker-indicator {
                background: transparent;
                bottom: 0;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
              }
            `}</style>
            <div style={styles.calendarIcon}>📅</div>
          </div>
        );

      case "longText":
        return (
          <textarea
            ref={textareaRef}
            value={value || ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => handleValueChange(e.target.value)}
            style={{ 
              ...getBaseInputStyle(isFocused), 
              resize: "none", 
              minHeight: "80px", 
              overflowY: "auto",
              display: "block" 
            }}
            placeholder="Enter your response..."
          />
        );

      case "dropdown":
        return (
          <div style={{ position: "relative" }}>
            <select
              value={value || ""}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{ ...getBaseInputStyle(isFocused), appearance: "none" }}
            >
              <option value="">Select an option...</option>
              {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <div style={styles.dropdownArrow}>▼</div>
          </div>
        );

      case "multipleChoice":
      case "checkboxes":
        const isMulti = type === "checkboxes";
        return (
          <div style={styles.optionsGrid}>
            {options.map((opt, i) => {
              const isSelected = isMulti 
                ? Array.isArray(value) && value.includes(opt)
                : value === opt;
              return (
                <label key={i} style={{
                  ...styles.optionRow,
                  borderColor: isSelected ? THEME.maroon : THEME.border,
                  backgroundColor: isSelected ? THEME.maroonSoft : THEME.white
                }}>
                  <input
                    type={isMulti ? "checkbox" : "radio"}
                    checked={isSelected}
                    onChange={(e) => {
                      if (!isMulti) return handleValueChange(opt);
                      const curr = Array.isArray(value) ? value : [];
                      handleValueChange(e.target.checked ? [...curr, opt] : curr.filter(x => x !== opt));
                    }}
                    style={styles.themeInput} 
                  />
                  <span style={{ color: isSelected ? THEME.maroon : THEME.text, fontWeight: isSelected ? 600 : 400 }}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case "file":
        const { allowedTypes = [], maxSizeMB = 5 } = fileConfig || {};
        // Convert ['jpg', 'pdf'] to '.jpg,.pdf'
        const acceptString = allowedTypes.map(t => t.startsWith('.') ? t : `.${t}`).join(',');
        
        return (
          <div style={styles.fileContainer}>
            <label style={styles.fileButton}>
              Upload File
              <input
                type="file"
                accept={acceptString} // Only shows allowed types in file picker
                style={{ display: "none" }}
                onChange={(e) => handleValueChange(e.target.files[0])}
              />
            </label>
            <span style={styles.helper}>
              Accepted: {allowedTypes.join(", ").toUpperCase()} (Max {maxSizeMB}MB)
            </span>
            {value && <div style={styles.fileName}>✓ {value.name}</div>}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{
      ...styles.card, 
      backgroundColor: (highlightEmpty && required && !value) ? "#fffafa" : THEME.white,
      borderColor: (highlightEmpty && required && !value) ? THEME.error : THEME.border,
    }}>
      <div style={styles.labelRow}>
        <label style={{...styles.label, fontSize: 14 * SCALE.label}}>
          {label} {required && <span style={{ color: THEME.maroon }}>*</span>}
        </label>
      </div>
      {renderInput()}
      {(error || localError) && <p style={styles.errorText}>{error || localError}</p>}
    </div>
  );
}

const styles = {
  card: {
    padding: wh(20),
    borderRadius: w(12),
    border: "2px solid #7a0c0c", // make border thicker and use a strong color (maroon)
    marginBottom: h(20),
    transition: "all 0.2s",
    boxShadow: "0 0 8px rgba(122,12,12,0.3)", // subtle shadow for extra prominence
  },

  labelRow: {
    marginBottom: h(12),
  },

  label: {
    fontWeight: 600,
    color: THEME.text,
  },

  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: h(8),
  },

  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: w(12),
    // Updated to use SCALE.option
    padding: `${14 * SCALE.option}px ${20 * SCALE.option}px`, 
    borderRadius: w(8),
    border: "1px solid",
    cursor: "pointer",
    transition: "0.2s",
    fontSize: 16 * SCALE.option, // Added font size control for options
  },

  themeInput: {
    accentColor: THEME.maroon,
    // Updated to use SCALE.selection
    width: 18 * SCALE.selection + "px",
    height: 18 * SCALE.selection + "px",
    cursor: "pointer",
  },

  fileButton: {
    // Updated to use SCALE.button
    padding: `${10 * SCALE.button}px ${20 * SCALE.button}px`,
    fontSize: 14 * SCALE.button + "px",
    width: "fit-content", // Ensures it doesn't stretch to full width
    backgroundColor: THEME.blue,
    color: "#fff",
    borderRadius: w(4),
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownArrow: {
    position: "absolute",
    right: w(15),
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: THEME.maroon,
    fontSize: w(12),
  },

  calendarIcon: {
    position: "absolute",
    right: w(15),
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: w(16),
  },

  fileContainer: {
    display: "flex",
    flexDirection: "column",
    gap: h(8),
  },

  helper: {
    fontSize: w(12),
    color: THEME.muted,
  },

  fileName: {
    fontSize: w(13),
    color: THEME.blue,
    fontWeight: 600,
  },

  errorText: {
    marginTop: h(8),
    fontSize: w(13),
    color: THEME.error,
    fontWeight: 500,
  },
};
