import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import "./App.css";
import Note from "./components/Note";
import { useNavigate } from "react-router-dom";

// CYCLE DE VIE du composant App :
// 1. rendu initial (avec les valeurs d'état initiales)
// 2. exécution de l'action du `useEffect` : mise à jour de l'état
// 4. ce qui fait automatiquement un nouveau rendu

function App() {

  const [notes, setNotes] = useState(null);
  const [allNotes, setAllNotes] = useState(null);
  const navigate = useNavigate();

  const notesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const fetchNotes = useCallback(async () => {
    try {

      const response = await fetch("http://localhost:4000/notes");
      const data = await response.json();
      data.sort((a, b) => new Date(b.lastmodif) - new Date(a.lastmodif));
      setAllNotes(data);

      const filteredNotes = data.filter((note) => note);
      const pinnedNotes = filteredNotes.filter((note) => note?.ispinned);
      const unpinnedNotes = filteredNotes.filter((note) => !note?.ispinned);

      const sortedPinnedNotes = pinnedNotes.sort((a, b) => {
        return new Date(b.dateModified) - new Date(a.dateModified);
      });
      const sortedUnpinnedNotes = unpinnedNotes.sort((a, b) => {
        return new Date(b.dateModified) - new Date(a.dateModified);
      });

      const sortedNotes = [...sortedPinnedNotes, ...sortedUnpinnedNotes];

      setMaxPage(Math.ceil(sortedNotes.length / notesPerPage));
      const startIndex = (currentPage - 1) * notesPerPage;
      const endIndex = startIndex + notesPerPage;
      const notesForCurrentPage = sortedNotes.slice(startIndex, endIndex);
      setNotes(notesForCurrentPage);

    } catch (error) {
      console.log(error);
    }
  }, [currentPage, notesPerPage]);


  useEffect(function () {
    fetchNotes();
  }, [fetchNotes]);
  useEffect(() => {
    fetchNotes();
  }, [currentPage, fetchNotes]);


  function nbNotes() {
    if (allNotes && Array.isArray(allNotes)) {
      return allNotes.length;
    } else {
      return 0;
    }
  }


  async function createNote() {
    const numberOfNotes = nbNotes();

    try {
      await fetch("http://localhost:4000/notes", {
        method: "POST",
        body: JSON.stringify({ id: await findId(), title: `Note ${numberOfNotes + 1}`, content: "Nouvelle note", lastmodif: new Date(), ispinned: 0 }),
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
    navigate("/");

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


  const pinNote = async (noteId) => {
    const noteToPin = notes.find((n) => n.id === noteId);
    if (!noteToPin) {
      console.error('Note non trouvée');
      return;
    }


    const updatedNote = {
      ...noteToPin,
      ispinned: !noteToPin.ispinned,
    };


    try {
      const response = await fetch(`http://localhost:4000/notes/${noteToPin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error('Erreur de mise à jour de la note');
      }

      // Recharge les notes après la mise à jour
      fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note :', error);
    }
  };


  return (
    <>
      <aside className="Side">
        <div>
          <div className="Notes-header">
            <button className="Button Button-create-note" onClick={createNote}>
              +
            </button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pageButtonsLeft">
              -
            </button>
            <span className="currentPage">{currentPage}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === maxPage} className="pageButtonsRight">
              +
            </button>
          </div>
          {notes !== null ? (
            <ol className="Notes-list">
              {notes.map((note) => (
                <li key={note.id}>
                  <Link className="Note-link" to={`/notes/${note.id}`}>
                    {note.title}
                  </Link>
                  <div className="dpinGrid">
                    <button
                      className="Button-delete"
                      onClick={() => deleteNote(note.id).then(fetchNotes).catch(console.error)}>
                      Supprimer
                    </button>
                    <button className={`Button ${note.ispinned ? "pinned" : "not_pin"}`} onClick={() => pinNote(note.id)}>{note.ispinned ? "Épinglé !" : "Épingler ?"}</button>
                  </div>
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
    </>
  );
}

export default App;
