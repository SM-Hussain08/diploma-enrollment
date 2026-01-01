import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./ProgramsPage.css"; 

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [originalPrograms, setOriginalPrograms] = useState([]); 
  const [newProgram, setNewProgram] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadPrograms(); }, []);

  async function loadPrograms() {
    try {
      const snap = await getDoc(doc(db, "formConfig", "mainConfig"));
      if (snap.exists()) {
        const data = snap.data();
        const list = data.sections?.programs?.list || [];
        setPrograms(list);
        setOriginalPrograms(JSON.parse(JSON.stringify(list)));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(programs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPrograms(items);
  };

  const addProgram = () => {
    if (!newProgram.trim()) return;
    setPrograms([...programs, newProgram.trim()]);
    setNewProgram("");
  };

  async function saveAllChanges() {
    setIsSaving(true);
    try {
      const ref = doc(db, "formConfig", "mainConfig");
      await updateDoc(ref, { "sections.programs.list": programs });
      setOriginalPrograms(JSON.parse(JSON.stringify(programs)));
    } catch (err) { alert("Failed to save"); }
    finally { setIsSaving(false); }
  }

  const isDirty = JSON.stringify(programs) !== JSON.stringify(originalPrograms);

  if (loading) return <div className="loader">Synchronizing...</div>;

  return (
    <div className="programs-view">
      <header className="programs-header-row">
        <div className="title-group">
          <h2>Program Catalog</h2>
          <p>Manage and reorder the list of available diplomas.</p>
        </div>
        <button 
          className={`save-catalog-btn ${isDirty ? 'active-pulse' : ''}`}
          disabled={!isDirty || isSaving}
          onClick={saveAllChanges}
        >
          {isSaving ? "Saving..." : isDirty ? "Save Catalog Order" : "Catalog Up to Date"}
        </button>
      </header>

      <div className="programs-main-grid">
        {/* LEFT: ADD PROGRAM CARD */}
        <aside className="add-program-sidebar">
          <div className="sidebar-card">
            <span className="badge-system">Management</span>
            <h3>Quick Add</h3>
            <p className="instruction-text">Add a new diploma to the active enrollment list.</p>
            
            <div className="input-container-premium">
              <input
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value)}
                placeholder="Program name..."
                onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              />
            </div>
            
            <button className="add-action-btn" onClick={addProgram}>
              Add to List
            </button>
            <div className="drag-hint">Use ⠿ to reorder priority on the right.</div>
          </div>
        </aside>

        {/* RIGHT: DRAGGABLE LIST */}
        <main className="list-area">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="prog-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="cards-stack">
                  {programs.map((p, i) => (
                    <Draggable key={i} draggableId={`item-${i}`} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`prog-row ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          style={provided.draggableProps.style}
                        >
                          <div {...provided.dragHandleProps} className="drag-icon">⠿</div>
                          
                          <input
                            className="prog-input-edit"
                            value={p}
                            onChange={(e) => {
                              const updated = [...programs];
                              updated[i] = e.target.value;
                              setPrograms(updated);
                            }}
                          />

                          <button 
                            className="prog-delete-btn" 
                            onClick={() => setPrograms(programs.filter((_, idx) => idx !== i))}
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
        </main>
      </div>
    </div>
  );
}