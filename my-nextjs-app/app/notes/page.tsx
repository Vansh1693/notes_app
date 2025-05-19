"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Note {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndNotes = async () => {
      const response = await supabase.auth.getSession();
      const session = response.data.session;
      const error = response.error;

      if (error || !session?.user) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
      await loadNotes(session.user.id);
      setLoading(false);
    };

    fetchSessionAndNotes();
  }, [router]);

  const loadNotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      alert("Error loading notes: " + (error as Error).message);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !userId) return;

    try {
      const { error } = await supabase.from("notes").insert({
        content: newNote,
        user_id: userId,
      });

      if (error) throw error;

      setNewNote("");
      await loadNotes(userId);
    } catch (error) {
      alert("Error adding note: " + (error as Error).message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Your Notes</h1>
      <div>
        <textarea
          rows={4}
          style={{ width: "100%" }}
          placeholder="Write a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button onClick={addNote} style={{ marginTop: 10 }}>
          Add Note
        </button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {notes.length === 0 && <li>No notes yet.</li>}
        {notes.map((note) => (
          <li key={note.id} style={{ marginBottom: 10 }}>
            {note.content}
            <br />
            <small style={{ color: "#666" }}>
              {new Date(note.created_at).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>

      <button onClick={logout} style={{ marginTop: 30, color: "red" }}>
        Logout
      </button>
    </div>
  );
}
