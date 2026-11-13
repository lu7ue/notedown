import { api, type NoteChanges } from "../api";
import { useEffect, useRef, useState } from "react";

const DELAY_MS = 1000; // 1 second

export type SaveStatus = "idle" | "saving" | "saved" | "error";

// collects changes to a note and sends them in one request, 1 second after the last change
export function useAutosave(noteId: number | null, onSaved: () => void) {
  // useState will render the component when the state changes, but useRef keeps values without rerendering
  const pending = useRef<NoteChanges>({});
  const timer = useRef<number | undefined>(undefined);

  const [status, setStatus] = useState<SaveStatus>("idle");

  function send(id: number, keepalive = false) {
    const changes = pending.current;
    if (Object.keys(changes).length === 0) return; // nothing changed since the last save
    api.updateNote(id, changes, keepalive).then(
      () => {
        if (Object.keys(pending.current).length === 0) setStatus("saved");
        onSaved();
      },
      () => setStatus("error"),
    );
    pending.current = {};
  }

  function queue(changes: NoteChanges) {
    // no open note, nothing to save (this also tells TS that noteId is a number below)
    if (noteId === null) return;

    // remember which note this change belongs to, so the timer saves to it even if another note is opened in the meantime
    const id = noteId;

    // merge the new changes with the old ones (if user keeps typing)
    pending.current = { ...pending.current, ...changes };
    setStatus("saving");

    // restart the countdown: cancel the timer from the previous change
    window.clearTimeout(timer.current);

    const sendLater = () => send(id);
    timer.current = window.setTimeout(sendLater, DELAY_MS);
  }

  // when user switches to another note, save the contents immediately (without waiting for 1 second)
  useEffect(() => {
    if (noteId === null) return;

    // reloading or closing the page skips the funtion returned below, so save from the pagehide event instead
    const onPageHide = () => send(noteId, true);
    window.addEventListener("pagehide", onPageHide);

    // runs when another note is opened: stop listening for this note, and save its changes immediately
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      send(noteId);
    };
  }, [noteId]);

  // when cursor leaves the title input field, save the title immediately (without waiting for 1 second)
  function flush() {
    if (noteId !== null) send(noteId);
  }

  // when user discards the changes (e.g. by deleting the note), cancel the timer and forget the changes
  function discard() {
    window.clearTimeout(timer.current);
    pending.current = {};
  }

  return { queue, flush, discard, status };
}
