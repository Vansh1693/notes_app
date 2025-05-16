'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NotesPage() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is logged in and fetch notes
  useEffect(() => {
    const getUserAndNotes = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      fetchNotes(data.user.id);
    };

    getUserAndNotes();
  }, [router]);

  // Fetch user's notes
  const fetchNotes = async (userId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes(data);
      setError('');
    }
  };

  // Add a new note
  const addNote = async () => {
    if (!newNote.trim()) return;

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    const { error } = await supabase.from('notes').insert([
      {
        user_id: user.id,
        content: newNote.trim(),
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setNewNote('');
      fetchNotes(user.id);
      setError('');
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', color: 'white', padding: '2rem', backgroundColor: '#000', borderRadius: 8 }}>
      <h2>My Notes</h2>

      <textarea
        placeholder="Write a new note..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        style={{ width: '100%', height: '100px', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button onClick={addNote} style={{ marginRight: '1rem' }}>Add Note</button>
      <button onClick={handleLogout}>Logout</button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <ul style={{ marginTop: '2rem', listStyleType: 'none', paddingLeft: 0 }}>
        {notes.length === 0 && <li>No notes yet.</li>}
        {notes.map((note) => (
          <li key={note.id} style={{ marginBottom: '1rem', backgroundColor: '#222', padding: '1rem', borderRadius: 4 }}>
            {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
