import { useState } from "react";

export default function ChatbotWidget({ transactions }: any) {
  const [open, setOpen] = useState(false);
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
        transactions: transactions,
      }),
    });

    const data = await res.json();

    const botMsg = { sender: "bot", text: data.reply };
    setMessages((prev) => [...prev, botMsg]);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-gray-900 p-4 rounded-xl shadow-xl">
          <h2 className="text-white mb-2">AI Assistant</h2>

          <div className="h-60 overflow-y-auto bg-gray-800 p-2 rounded mb-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <p
                  className={
                    msg.sender === "user"
                      ? "text-green-400"
                      : "text-blue-400"
                  }
                >
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 p-2 rounded bg-gray-800 text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />

            <button
              className="bg-green-500 px-3 rounded"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}