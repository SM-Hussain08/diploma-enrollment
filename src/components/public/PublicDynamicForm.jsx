import { useState } from "react";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PublicDynamicForm({
  questions = [],
  answers = {},
  onChange
}) {
  const [uploading, setUploading] = useState(null);

  const handleValueChange = (id, value) => {
    onChange({
      ...answers,
      [id]: value
    });
  };

  async function handleFileUpload(id, file) {
    setUploading(id);
    const fileRef = ref(storage, `enrollments/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    handleValueChange(id, url);
    setUploading(null);
  }

  return (
    <div className="public-form-wrapper">
      {questions.map((q) => (
        <div key={q.id} className="public-question-block">
          <label>
            {q.label}
            {q.required && <span className="req">*</span>}
          </label>

          {/* SHORT TEXT */}
          {q.type === "shortText" && (
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => handleValueChange(q.id, e.target.value)}
            />
          )}

          {/* LONG TEXT */}
          {q.type === "longText" && (
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleValueChange(q.id, e.target.value)}
            />
          )}

          {/* EMAIL */}
          {q.type === "email" && (
            <input
              type="email"
              value={answers[q.id] || ""}
              onChange={(e) => handleValueChange(q.id, e.target.value)}
            />
          )}

          {/* NUMBER */}
          {q.type === "number" && (
            <input
              type="number"
              value={answers[q.id] || ""}
              onChange={(e) => handleValueChange(q.id, e.target.value)}
            />
          )}

          {/* DROPDOWN */}
          {q.type === "dropdown" && (
            <select
              value={answers[q.id] || ""}
              onChange={(e) => handleValueChange(q.id, e.target.value)}
            >
              <option value="">Select</option>
              {q.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* RADIO */}
          {q.type === "radio" && (
            <div className="radio-group">
              {q.options?.map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    checked={answers[q.id] === opt}
                    onChange={() => handleValueChange(q.id, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {/* CHECKBOX */}
          {q.type === "checkbox" && (
            <div className="checkbox-group">
              {q.options?.map((opt) => {
                const arr = answers[q.id] || [];
                return (
                  <label key={opt}>
                    <input
                      type="checkbox"
                      checked={arr.includes(opt)}
                      onChange={() => {
                        const updated = arr.includes(opt)
                          ? arr.filter(o => o !== opt)
                          : [...arr, opt];
                        handleValueChange(q.id, updated);
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {/* FILE UPLOAD */}
          {q.type === "file" && (
            <div>
              <input
                type="file"
                onChange={(e) => handleFileUpload(q.id, e.target.files[0])}
              />
              {uploading === q.id && <p>Uploading...</p>}
              {answers[q.id] && <p className="file-ok">File uploaded ✔</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
