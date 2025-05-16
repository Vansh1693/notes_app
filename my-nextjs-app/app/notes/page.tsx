'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Note {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export default function NotesPage() {
  const [user, setUser] = useState<null | { id: string }>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id });
        fetchNotes(user.id);
      } else {
        window.location.href = '/login'; // Redirect if not logged in
      }
    };
    getUser();
  }, []);

  // Fetch user's notes
  const fetchNotes = async (userId: string) => {
    const { data, error } = await supabase
      .from<Note>('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  // Add a new note
  const addNote = async () => {
    if (!newNote || !user) return;

    const { error } = await supabase.from('notes').insert([
      {
        user_id: user.id,
        content: newNote,
      },
    ]);

    if (!error) {
      setNewNote('');
      fetchNotes(user.id); // Refresh notes
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div style={{ color: 'white', padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>My Notes</h2>
      <textarea
        placeholder="Write a new note..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        style={{ display: 'block', width: '100%', height: '100px', marginBottom: '1rem' }}
      />
      <button onClick={addNote} style={{ marginRight: '1rem' }}>
        Add Note
      </button>
      <button onClick={logout}>Logout</button>

      <ul style={{ marginTop: '2rem' }}>
        {notes.map((note) => (
          <li key={note.id} style={{ marginBottom: '1rem', backgroundColor: '#222', padding: '1rem', borderRadius: '5px' }}>
            {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
