import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Note.css";

function Note({onSaveSuccess}) {
  const { id } = useParams();

  const [note, setNote] = useState(null);

  async function fetchNote() {
    const response = await fetch(`/notes/${id}`);
    const data = await response.json();

    setNote(data);
    }

  async function saveNote() {
    const response = await fetch(`/notes/${id}`, {
      method: "PUT", 
      headers: {"Content-type": "application/json"}, 
      body: JSON.stringify(note)});
      onSaveSuccess();
  }

    useEffect(function () {
    fetchNote();
    }, [id]);

    if (!note) {
      return "Chargement...";
    }

  return (
    <form className="Form" onSubmit={(event) => {event.preventDefault(); saveNote();}}>
      <input
      className="Note-editable Note-title"
      type="text"
      value={note.title}
      onChange={(event) => {
        setNote({...note, title: event.target.value});
      }}
      />

      <textarea
      className="Note-editable Note-content"
      value={note.content}
      onChange={(event) => {
        setNote({...note, content: event.target.value});
      }}
      />
      <div className="Note-actions">
        <button className="Button">Enregistrer</button>
      </div>
    </form>
  );
}

export default Note;
