// ===============================
// GeneralInfoPage.jsx
// Admin UI for managing "General Information" form questions
// Allows creating, editing, reordering, and saving form fields
// ===============================

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import QuestionEditor from "../../components/admin/QuestionEditor";
import { v4 as uuid } from "uuid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./UserInfoPage.css";

export default function GeneralInfoPage() {
  // -------------------------------
  // State Management
  // -------------------------------
  const [questions, setQuestions] = useState([]); // All general info questions
  const [loading, setLoading] = useState(true);   // Initial load state
  const [isSaving, setIsSaving] = useState(false); // Save button state
  const [scrolled, setScrolled] = useState(false); // Header shrink effect

  // -------------------------------
  // Initial Load + Scroll Listener
  // -------------------------------
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    load();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------------------
  // Load Questions from Firestore
  // -------------------------------
  async function load() {
    try {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setQuestions(snap.data().sections.generalInfo.questions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // Drag & Drop Reordering Logic
  // -------------------------------
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
  };

  // -------------------------------
  // Persist Changes to Firestore
  // -------------------------------
  async function saveAllChanges() {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "formConfig", "mainConfig"), {
        "sections.generalInfo.questions": questions,
      });
    } catch (err) {
      alert("Save failed");
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }

  // -------------------------------
  // Add New Question (Default Shape)
  // -------------------------------
  function addQuestion() {
    const q = {
      id: uuid(),
      label: "",
      type: "shortText",
      required: false,
      options: ["Option 1"],
      fileConfig: { allowedTypes: ["pdf"], maxSizeMB: 5 },
    };
    setQuestions([...questions, q]);
  }

  // -------------------------------
  // Loading State
  // -------------------------------
  if (loading) {
    return (
      <div className="admin-loader-container">
        <div className="loader-orbit"></div>
        <p>Synchronizing Form Structure...</p>
      </div>
    );
  }

  // -------------------------------
  // Main Render
  // -------------------------------
  return (
    <div className="mgmt-page-wrapper">
      
      {/* ================= HEADER ================= */}
      <header className={`mgmt-header-premium ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          
          {/* Brand & Stats */}
          <div className="brand-stack">
            <h1>General Segment</h1>
            <h2>Manage questions for general sention from here i.e questions that will appear at end.</h2>
            <div className="form-stats-bar">
              <span className="stat-pill">
                <b>{questions.length}</b> Fields
              </span>
              <span className="stat-pill">
                <b>{questions.filter(q => q.required).length}</b> Required
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="action-stack">
            <button className="secondary-btn" onClick={addQuestion}>
              <span className="btn-icon">+</span> New Question
            </button>

            <button
              className={`primary-btn ${isSaving ? "btn-pulse" : ""}`}
              onClick={saveAllChanges}
              disabled={isSaving}
            >
              {isSaving ? "Publishing..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="mgmt-container-focused">
        {questions.length > 0 ? (
          <>
            {/* Drag helper text */}
            <div className="drag-helper-text">
              <span>⠿</span> Drag card headers to reorder
            </div>

            {/* Question List */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="q-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="q-list-canvas"
                  >
                    {questions.map((q, i) => (
                      <Draggable key={q.id} draggableId={q.id} index={i}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`q-editor-wrapper entrance-anim ${
                              snapshot.isDragging ? "is-dragging" : ""
                            }`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            {/* Question Editor Card */}
                            <QuestionEditor
                              question={q}
                              index={i}
                              onChange={(idx, updated) => {
                                const copy = [...questions];
                                copy[idx] = updated;
                                setQuestions(copy);
                              }}
                              onDelete={() =>
                                setQuestions(
                                  questions.filter((_, idx) => idx !== i)
                                )
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add Another Question */}
            <button className="ghost-add-btn" onClick={addQuestion}>
              + Add another question
            </button>
          </>
        ) : (
          // Empty State
          <div
            className="empty-state-compact entrance-anim"
            onClick={addQuestion}
          >
            <div className="compact-plus">+</div>
            <div className="empty-text-stack">
              <h3>Form is empty</h3>
              <p>Click to add your first question</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
