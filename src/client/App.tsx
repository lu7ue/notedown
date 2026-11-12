import { useEffect, useState } from "react";

export function App() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/msg")
      .then((res) => res.json())
      .then((data) => setMsg(data.message));
  }, []);

  return <h1>Message from the server: {msg}</h1>;
}
