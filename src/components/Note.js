import { useParams, } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Note.css";
import Loader from "./Loader.js";

function Note({ onSaveSuccess }) {
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  async function fetchNote() {
    const response = await fetch(`/notes/${id}`);
    const data = await response.json();

    setNote(data);
  }


  async function saveNote() {

    const updatedNote = {
      ...note,
      lastmodif: new Date().toISOString(),
    };
    const response = await fetch(`/notes/${id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(updatedNote),

    });

    onSaveSuccess();

    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  }

  useEffect(function () {
    fetchNote();
  }, [id]);

  if (!note) {
    return <Loader />;
  }


  return (
    <form className="Form" onSubmit={(event) => { event.preventDefault(); saveNote(); }}>
      <input
        className="Note-editable Note-title"
        type="text"
        value={note.title}
        onChange={(event) => {
          setNote({ ...note, title: event.target.value });
        }}
      />

      <textarea
        className="Note-editable Note-content"
        value={note.content}
        onChange={(event) => {
          setNote({ ...note, content: event.target.value });
        }}
      />
      <div className="Note-actions">
        <button className="Button">Enregistrer</button>
        {showSuccessMessage && <div>Enregistré avec succès.</div>}
      </div>
    </form>
  );
}

export default Note;
