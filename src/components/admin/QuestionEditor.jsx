import { useState } from "react";
import { QUESTION_TYPES } from "../../utils/questionTypes";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./QuestionEditor.css";

const typeHelpers = {
  shortText: "Single-line response",
  longText: "Paragraph style response",
  email: "Valid email input",
  number: "Numeric values only",
  date: "Date picker",
  file: "File upload with limits",
  multipleChoice: "Select one option",
  checkboxes: "Select multiple options",
  dropdown: "Compact list selection",
};

export default function QuestionEditor({ question, index, onChange, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLocked = question.immutable === true;
  const type = question.type || "shortText";
  const needsOptions = ["multipleChoice", "checkboxes", "dropdown"].includes(type);

  const update = (field, value) => {
    if (isLocked) return;
    onChange(index, { ...question, [field]: value });
  };

  const updateFileConfig = (key, value) => {
    const current = question.fileConfig || { allowedTypes: [], maxSizeMB: 5 };
    update("fileConfig", { ...current, [key]: value });
  };

  return (
    <div className={`q-master-card ${isExpanded ? "expanded" : ""}`}>
      {/* ================= HEADER ================= */}
      <div className="q-header">
        <div className="q-header-left">
          <label
            className="q-toggle-switch"
            onClick={(e) => e.stopPropagation()}
            title="Required"
          >
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => update("required", e.target.checked)}
            />
            <span className="q-toggle-slider" />
          </label>

          <span className="q-drag-handle">⠿</span>
        </div>

        {/* ✅ EDITING QUESTION AUTO-EXPANDS */}
        <input
          className="q-label-input"
          placeholder="Add question text..."
          value={question.label || ""}
          onFocus={() => setIsExpanded(true)}   // ✅ expand on edit
          onChange={(e) => {
            setIsExpanded(true);                // ✅ expand on typing
            update("label", e.target.value);
          }}
          readOnly={isLocked}
        />

        <div className="q-header-right">
          {question.required && <span className="q-badge required">Required</span>}
          {isLocked && <span className="q-badge lock">Locked</span>}

          <span className="q-type-pill">  
            {QUESTION_TYPES.find((t) => t.value === type)?.label}
          </span>

          {/* 🔴 Always-visible delete (even when minimized) */}
          {!isLocked && (
            <button
              className="q-header-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              title="Delete question"
            >
              ✕
            </button>
          )}
        </div>
        
      </div>

      {/* ================= BODY ================= */}
      {isExpanded && (
        <div className="q-body animate-slide-down">
          {/* SETTINGS */}
          <div className="q-settings-card">
            <h4>Question Settings</h4>

            <label className="q-field-label">Input Type</label>
            <select
              value={type}
              onChange={(e) => update("type", e.target.value)}
              disabled={isLocked}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <p className="q-type-description">{typeHelpers[type]}</p>

            {/* FILE CONFIG */}
            {type === "file" && (
              <div className="q-file-config">
                <div>
                  {/* ✅ LABEL WITH COLOR CONTROL */}
                  <span className="q-file-label">Allowed Formats</span>
                  <div className="q-pill-row">
                    {["pdf", "jpg", "png", "docx"].map((ext) => (
                      <button
                        key={ext}
                        className={`q-pill ${
                          question.fileConfig?.allowedTypes?.includes(ext)
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          const curr = question.fileConfig?.allowedTypes || [];
                          const next = curr.includes(ext)
                            ? curr.filter((x) => x !== ext)
                            : [...curr, ext];
                          updateFileConfig("allowedTypes", next);
                        }}
                      >
                        {ext.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {/* ✅ LABEL WITH COLOR CONTROL */}
                  <span className="q-file-label">Max Size</span>
                  <div className="q-pill-row">
                    {[5, 10, 20, 50].map((size) => (
                      <button
                        key={size}
                        className={`q-pill ${
                          question.fileConfig?.maxSizeMB === size
                            ? "active"
                            : ""
                        }`}
                        onClick={() => updateFileConfig("maxSizeMB", size)}
                      >
                        {size}MB
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* OPTIONS (unchanged) */}
          {needsOptions && (
            <div className="q-settings-card">
              <h4>
                {type === "dropdown" ? "Dropdown Items" : "Answer Choices"}
              </h4>

              <DragDropContext
                onDragEnd={(res) => {
                  if (!res.destination) return;
                  const items = [...question.options];
                  const [moved] = items.splice(res.source.index, 1);
                  items.splice(res.destination.index, 0, moved);
                  update("options", items);
                }}
              >
                <Droppable droppableId={`opts-${index}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {question.options?.map((opt, i) => (
                        <Draggable
                          key={i}
                          draggableId={`opt-${index}-${i}`}
                          index={i}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="q-opt-row"
                            >
                              <span
                                {...provided.dragHandleProps}
                                className="q-opt-drag"
                              >
                                ⠿
                              </span>

                              <span className={`q-option-indicator ${type}`} />

                              <input
                                className="q-opt-input"
                                value={opt}
                                onChange={(e) => {
                                  const next = [...question.options];
                                  next[i] = e.target.value;
                                  update("options", next);
                                }}
                              />

                              <button
                                className="q-opt-delete"
                                onClick={() =>
                                  update(
                                    "options",
                                    question.options.filter(
                                      (_, idx) => idx !== i
                                    )
                                  )
                                }
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <button
                className="q-add-btn"
                onClick={() =>
                  update("options", [
                    ...(question.options || []),
                    `Option ${question.options.length + 1}`,
                  ])
                }
              >
                + Add Option
              </button>
            </div>
          )}

          {/* ✅ MINIMIZE MOVED TO BOTTOM LEFT OF DELETE */}
          {!isLocked && (
            <div className="q-danger-zone">
              <button
                className="q-minimize-btn bottom"
                onClick={() => setIsExpanded(false)}
              >
                Minimize
              </button>

              <button className="q-delete-btn" onClick={() => onDelete(index)}>
                Delete Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
