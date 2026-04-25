import { useState, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello 👋 मैं Yuvi हूँ" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  // 🔊 Speak Hindi
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    window.speechSynthesis.speak(speech);
  };

  // 💬 Send Message
  const handleSend = async (text) => {
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    speak(data.reply);
  };

  // 🎤 Command Listening
  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "hi-IN";

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      handleSend(text);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
  };

  // 🧠 Wake Word (Hey Yuvi)
  useEffect(() => {
    startWakeListening();
  }, []);

  const startWakeListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (text.includes("hey yuvi")) {
        startListening();
      }
    };

    recognition.start();

    recognition.onerror = () => {
      recognition.stop();
      startWakeListening();
    };
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">Yuvi AI</h1>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[70%] ${
              msg.sender === "user"
                ? "bg-blue-500 ml-auto"
                : "bg-slate-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 flex gap-2 border-t border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-slate-800"
          placeholder="कुछ लिखो..."
        />

        <button
          onClick={() => handleSend(input)}
          className="bg-blue-500 px-4 rounded"
        >
          भेजो
        </button>

        <button
          onClick={startListening}
          className={`px-4 rounded ${
            isListening ? "bg-purple-500" : "bg-green-500"
          }`}
        >
          🎤
        </button>
      </div>
    </div>
  );
}
