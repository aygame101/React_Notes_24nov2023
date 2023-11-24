export const fetchNotes = async () => {
    const response = await fetch('http://localhost:4000/notes');
    if (!response.ok) throw new Error('Aucune réponse du server');
  
    return response.json().then((data) =>
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  };
  
  export const createNote = async () => {
    const response = await fetch('http://localhost:4000/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Nouvelle note',
        content: 'Contenu de la nouvelle note',
        createdAt: new Date().toISOString(),
      }),
    });
  
    if (response.ok) return response.json();
    else throw new Error('Erreur lors de la création de la note');
  };