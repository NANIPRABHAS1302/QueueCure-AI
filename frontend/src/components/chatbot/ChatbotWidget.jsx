import { useState, useRef, useEffect } from "react";
import { api } from "../../services/api/apiService.js";

export const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello! I am your QueueCure AI Medical Assistant. Describe your symptoms (e.g. chest pain, fever) or ask a question about hospital appointments."
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = message;
        setMessage("");
        setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post("/chatbot/message", { message: userMsg });
            setMessages((prev) => [...prev, { sender: "bot", text: res.answer }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "I'm having trouble connecting right now. Please try again shortly." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 glow-blue cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Chat Box Panel */}
            {isOpen && (
                <div className="w-96 h-[500px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                                🤖
                            </div>
                            <div>
                                <h4 className="text-sm font-bold font-outfit">QueueCure AI assistant</h4>
                                <span className="text-[10px] text-blue-200">Online & Ready</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                        msg.sender === "user"
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none"
                                    }`}
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Form */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe symptoms or ask FAQ..."
                            className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-600 focus:outline-none text-white placeholder-slate-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
export default ChatbotWidget;
