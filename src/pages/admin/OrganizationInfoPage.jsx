import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import QuestionEditor from "../../components/admin/QuestionEditor";
import { v4 as uuid } from "uuid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./UserInfoPage.css"; // Reusing User page styles

export default function OrganizationInfo() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    load();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function load() {
    try {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        setQuestions(snap.data().sections.organizationInfo.questions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  /* Prevent moving the immutable (last) question */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = [...questions];
    const sourceItem = items[result.source.index];

    if (sourceItem.immutable) return;
    if (result.destination.index >= items.length - 1) return;

    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setQuestions(items);
  };

  async function saveAllChanges() {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "formConfig", "mainConfig"), {
        "sections.organizationInfo.questions": questions,
      });
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }

  function addQuestion() {
    const q = {
      id: uuid(),
      label: "",
      type: "shortText",
      required: false,
      options: [],
      immutable: false,
    };

    const copy = [...questions];
    copy.splice(copy.length - 1, 0, q); // Insert before fixed question
    setQuestions(copy);
  }

  if (loading) {
    return (
      <div className="admin-loader-container">
        <div className="loader-orbit"></div>
        <p>Loading Organization Schema...</p>
      </div>
    );
  }

  const editableQuestions = questions.filter(q => !q.immutable);
  const fixedQuestion = questions.find(q => q.immutable);

  return (
    <div className="mgmt-page-wrapper">
      {/* HEADER — identical UX to User Info */}
      <header className={`mgmt-header-premium ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <div className="brand-stack">
            <h1>Organization Segment</h1>
            <h2>Manage questions for organization section and sponsor details from here.</h2>
            <div className="form-stats-bar">
              <span className="stat-pill">
                <b>{editableQuestions.length}</b> Fields
              </span>
            </div>
          </div>

          <div className="action-stack">
            <button className="secondary-btn" onClick={addQuestion}>
              + New Question
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

      <div className="mgmt-container-focused">
        {/* ===== TOP SECTION: EDITABLE QUESTIONS ===== */}
        {editableQuestions.length === 0 ? (
          /* SAME EMPTY STATE AS USER INFO */
          <div className="empty-state-compact entrance-anim" onClick={addQuestion}>
            <div className="compact-plus">+</div>
            <div className="empty-text-stack">
              <h3>Form is empty</h3>
              <p>Click to add your first question</p>
            </div>
          </div>
        ) : (
          <>
            <div className="drag-helper-text">
              <span>⠿</span> Drag fields to reorder
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="org-editable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {editableQuestions.map((q, i) => (
                      <Draggable key={q.id} draggableId={q.id} index={i}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`q-editor-wrapper entrance-anim ${
                              snapshot.isDragging ? "is-dragging" : ""
                            }`}
                          >
                            <QuestionEditor
                              question={q}
                              index={questions.indexOf(q)}
                              onChange={(idx, updated) => {
                                const copy = [...questions];
                                copy[idx] = updated;
                                setQuestions(copy);
                              }}
                              onDelete={(idx) =>
                                setQuestions(questions.filter((_, i) => i !== idx))
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

            <button className="ghost-add-btn" onClick={addQuestion}>
              + Add another question
            </button>
          </>
        )}

        {/* ===== FIXED IMMUTABLE SECTION ===== */}
        {fixedQuestion && (
          <div className="org-fixed-section entrance-anim">
            <div className="section-divider">
              <span>System Required Field</span>
            </div>

            <div className="q-editor-wrapper is-fixed-wrapper">
              <QuestionEditor
                question={fixedQuestion}
                index={questions.indexOf(fixedQuestion)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
