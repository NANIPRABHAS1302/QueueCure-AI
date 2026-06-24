import { useState, useEffect } from "react";
import { socketListener } from "../../services/socket/socketService.js";

export const QueueDashboard = () => {
    const [currentToken, setCurrentToken] = useState(null);
    const [waitingPatients, setWaitingPatients] = useState([]);
    const [waitingCount, setWaitingCount] = useState(0);
    const [time, setTime] = useState(new Date());

    const envUrl = import.meta.env.VITE_API_URL;
    const BASE = envUrl 
        ? (envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`)
        : "http://localhost:5000/api";

    const loadDashboard = async () => {
        try {
            const [currentRes, waitingRes] = await Promise.all([
                fetch(`${BASE}/queue/current`).then(r => r.json()),
                fetch(`${BASE}/queue/waiting`).then(r => r.json())
            ]);
            setCurrentToken(currentRes.currentToken || null);
            setWaitingCount(waitingRes.totalWaiting || 0);
            setWaitingPatients(waitingRes.waitingPatients || []);
        } catch (err) {
            console.error("Queue display fetch error:", err);
        }
    };

    useEffect(() => {
        loadDashboard();

        // Clock
        const clockInterval = setInterval(() => setTime(new Date()), 1000);

        // Socket subscriptions
        const refresh = () => loadDashboard();
        socketListener.on("queueUpdated", refresh);
        socketListener.on("currentTokenUpdated", refresh);
        socketListener.on("tokenCalled", refresh);

        // Polling fallback every 15s
        const pollInterval = setInterval(loadDashboard, 15000);

        return () => {
            clearInterval(clockInterval);
            clearInterval(pollInterval);
            socketListener.off("queueUpdated", refresh);
            socketListener.off("currentTokenUpdated", refresh);
            socketListener.off("tokenCalled", refresh);
        };
    }, []);

    const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none"></div>

            {/* Top bar */}
            <header className="h-20 px-10 flex items-center justify-between border-b border-slate-900">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-blue-500/20">Q</div>
                    <div>
                        <h1 className="text-xl font-extrabold font-outfit tracking-tight">QueueCure AI</h1>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Hospital Lobby Display</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-white tracking-wider">{formatTime(time)}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{formatDate(time)}</p>
                </div>
            </header>

            <main className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                    {/* Left: Giant Current Token */}
                    <div className="lg:col-span-1">
                        <div className="rounded-[2rem] bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/15 p-10 text-center relative overflow-hidden shadow-2xl shadow-blue-500/5">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent"></div>
                            <div className="relative z-10">
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Now Serving</span>
                                {currentToken ? (
                                    <div className="mt-6 space-y-6">
                                        <h1 className="text-[8rem] font-black font-outfit leading-none bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
                                            {currentToken.tokenNumber}
                                        </h1>
                                        <div className="space-y-2">
                                            <p className="text-lg font-semibold text-slate-200">{currentToken.patient?.fullName || "Patient"}</p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">In Consultation</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-10 space-y-4 py-10">
                                        <div className="text-6xl">🕐</div>
                                        <p className="text-lg font-semibold text-slate-400">Waiting for Next Call</p>
                                        <p className="text-xs text-slate-600">Please listen for your token number announcement</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="glass-card rounded-2xl p-5 text-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">In Queue</span>
                                <h2 className="text-4xl font-black font-outfit text-white mt-2">{waitingCount}</h2>
                            </div>
                            <div className="glass-card rounded-2xl p-5 text-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg Wait</span>
                                <h2 className="text-4xl font-black font-outfit text-blue-400 mt-2">{waitingCount > 0 ? waitingCount * 10 : 0}<span className="text-lg">m</span></h2>
                            </div>
                        </div>
                    </div>

                    {/* Right: Queue listing */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-[2rem] p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold font-outfit">Upcoming Patients</h2>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Feed</span>
                                </div>
                            </div>

                            {waitingPatients.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-5xl mb-4">✨</div>
                                    <p className="text-slate-400 text-sm font-semibold">Queue is clear — all patients served</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {waitingPatients.slice(0, 12).map((item, index) => (
                                        <div key={item._id}
                                            className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-300 ${
                                                index === 0
                                                    ? "bg-blue-600/10 border-blue-500/20 ring-1 ring-blue-500/10"
                                                    : "bg-slate-800/20 border-slate-800/60 hover:bg-slate-800/30"
                                            }`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${
                                                    index === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-300"
                                                }`}>
                                                    {item.tokenNumber}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.patient?.fullName || "Patient"}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{item.patient?.symptoms || "General Consultation"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                                    item.patient?.priority === "EMERGENCY" ? "bg-rose-500/10 text-rose-400" :
                                                    item.patient?.priority === "HIGH" ? "bg-amber-500/10 text-amber-400" :
                                                    "bg-slate-800 text-slate-400"
                                                }`}>{item.patient?.priority || "LOW"}</span>
                                                <div>
                                                    <span className="text-xs text-slate-400 font-semibold block">~{item.estimatedWaitTime}m</span>
                                                    {index === 0 && <span className="text-[10px] text-blue-400 font-bold">Next Up</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 h-12 bg-slate-950/90 border-t border-slate-900 flex items-center justify-center text-[10px] text-slate-600 font-semibold tracking-wider backdrop-blur-lg">
                QUEUECURE AI · SMART HOSPITAL QUEUE MANAGEMENT SYSTEM · POWERED BY AI
            </footer>
        </div>
    );
};
export default QueueDashboard;
