import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import "./App.css";
import Note from "./components/Note";

// CYCLE DE VIE du composant App :
// 1. rendu initial (avec les valeurs d'état initiales)
// 2. exécution de l'action du `useEffect` : mise à jour de l'état
// 4. ce qui fait automatiquement un nouveau rendu

function App() {
  // déclarer l'état pour stocker les notes
  const [notes, setNotes] = useState(null);

  async function fetchNotes() {
    const response = await fetch("/notes?_sort=id&_order=desc");
    const data = await response.json();
    setNotes(data);
  }

  async function createNote() {
    await fetch("/notes", {
      method: "POST",
      body: JSON.stringify({ title: "Nouvelle note", content: "" }),
      headers: { "Content-type": "application/json" },
    });
    fetchNotes();
  }

  useEffect(function () {
    fetchNotes();
  }, []);

  return (
    <BrowserRouter>
      <aside className="Side">
        <div>
          <button className="Button Button-create-note" onClick={createNote}>
            +
          </button>
          {notes !== null ? (
            <ol className="Notes-list">
              {notes.map((note) => (
                <li key={note.id}>
                  <Link className="Note-link" to={`/notes/${note.id}`}>
                    {note.title}
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </aside>
      <main className="Main">
        <Routes>
          <Route path="/" element="Sélectionner une note" />
          <Route path="/notes/:id" element={<Note />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
