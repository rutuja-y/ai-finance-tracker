import { useState } from "react";

export default function Chatbot({ transactions }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { sender: "user", text: input };

    setMessages([...messages, userMsg]);

    const res = await fetch("http://127.0.0.1:8000/chatbot/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        transactions: transactions
      }),
    });

    const data = await res.json();

    const botMsg = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">AI Chatbot 🤖</h1>

      <div className="bg-gray-800 p-4 h-96 overflow-y-auto rounded mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <p className={msg.sender === "user" ? "text-green-400" : "text-blue-400"}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 rounded bg-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          className="bg-green-500 px-4 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}