import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const conversationId = "abc123";
  const ws = useRef(null);

  useEffect(() => {
    // ✅ Connect to local backend
    ws.current = new WebSocket("ws://localhost:8000/ws/" + conversationId);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("💬 Message from server:", msg);

      setMessages((prev) => {
        const updated = [...prev, msg];
        localStorage.setItem("chatMessages", JSON.stringify(updated));
        return updated;
      });
    };

    ws.current.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (
      input.trim() &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const message = { text: input };
      ws.current.send(JSON.stringify(message));
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">Anonymous Chat</header>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-bubble">
            <div className="text">{msg.text}</div>
            <div className="timestamp">{msg.time}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder={connected ? "Type a message..." : "Connecting..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
