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
  const [note, setNote] = useState({ispinned: false });
  

  async function fetchNotes() {
    try {
      const response = await fetch("http://localhost:4000/notes");
    const data = await response.json();
    data.sort((a, b) => new Date(b.lastmodif) - new Date(a.lastmodif));
    setNotes(data);
    } catch (error) {
      console.log(error);
    }
  }


  

  const pinNote = async (noteId) => {
    const noteToPin = notes.find(n => n.id === noteId);
    if (!noteToPin) {
      console.error('Note non trouvée');
      return;
    }
    const updatedNote = {
      ...note,
      ispinned: !note.ispinned
    };
  console.log("ge");
    setNote(updatedNote);
  
    try {
      const response = await fetch(`http://localhost:4000/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });
  
      if (!response.ok) {
        throw new Error('Erreur de mise à jour de la note');
      }
      // Gérer la réponse ici, si nécessaire
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note :', error);
      // Ici, vous pourriez revenir en arrière sur le changement d'état en cas d'erreur
    }
  };
  


  async function createNote() { 
    
    try {
      await fetch("http://localhost:4000/notes", {
        method: "POST",
        body: JSON.stringify({ id: await findId(), title: "Nouvelle note", content: "", lastmodif: new Date(), ispinned: false}),
        headers: { "Content-type": "application/json" },
      });
      fetchNotes();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteNote = async (noteId) => {
    const response = await fetch(`http://localhost:4000/notes/${noteId}`, {
      method: 'DELETE',
    });
  
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la note');
    }
  };
  
  async function findId() {
    try {
      const response = await fetch("http://localhost:4000/notes");
      const data = await response.json();
      if (data && Array.isArray(data)) {
        if (data.length > 0) {
          const maxId = data.reduce((max, note) => {
            const noteId = parseInt(note.id, 10);
            return noteId > max ? noteId : max;
          }, 0);
          const newId = isNaN(maxId) ? 1 : maxId + 1;
          return String(newId);
        } else {
          console.error("Empty notes array in server response:", data);
          return String(1);
        }
      } else {
        console.error("Invalid server response format:", data);
        return String(1);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      return null;
    }
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
                  <button
                  className="Button-delete" 
                  onClick={() => deleteNote(note.id).then(fetchNotes).catch(console.error)}>
                  Supprimer
                  </button>
                  <button onClick={pinNote}>{note.ispinned ? "Épinglé" : "Épingler"}</button>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </aside>
      <main className="Main">
        <Routes>
          <Route path="/" element="Sélectionner une note" />
          <Route path="/notes/:id" element={<Note onSaveSuccess={fetchNotes} />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
