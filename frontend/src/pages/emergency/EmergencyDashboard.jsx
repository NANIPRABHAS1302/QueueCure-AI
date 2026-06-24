import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";
import { socketListener } from "../../services/socket/socketService.js";

export const EmergencyDashboard = () => {
    const [criticalQueue, setCriticalQueue] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadCriticalPatients = async () => {
        try {
            const res = await api.get("/emergency/critical");
            if (res.success && res.criticalPatients) {
                setCriticalQueue(res.criticalPatients);
            }
        } catch (err) {
            console.error("Failed to load critical patients", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCriticalPatients();

        const handleQueueUpdate = () => {
            console.log("🔄 Socket Event: Refreshing emergency console...");
            loadCriticalPatients();
        };

        socketListener.on("queueUpdated", handleQueueUpdate);
        return () => {
            socketListener.off("queueUpdated", handleQueueUpdate);
        };
    }, []);

    const searchPatients = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        setError("");
        try {
            // Find patients from patient directory
            const res = await api.get("/patients");
            if (res.success && res.patients) {
                const query = searchQuery.toLowerCase();
                const filtered = res.patients.filter(p => 
                    p.fullName?.toLowerCase().includes(query) || 
                    p.medicalCardNumber?.toLowerCase().includes(query) ||
                    p._id.toLowerCase().includes(query)
                );
                setSearchResults(filtered);
            }
        } catch (err) {
            setError("Failed to search patient directory.");
        } finally {
            setSearchLoading(false);
        }
    };

    // Trigger fast track API
    const triggerFastTrack = async (patientId) => {
        setError("");
        setSuccessMessage("");
        try {
            const res = await api.post("/emergency/fast-track", { patientId });
            if (res.success) {
                setSuccessMessage(res.message || "Patient successfully fast-tracked to the top of the queue.");
                setSearchQuery("");
                setSearchResults([]);
                loadCriticalPatients();
            } else {
                setError(res.message || "Failed to override queue priority.");
            }
        } catch (err) {
            setError(err.message || "Error occurred during emergency override.");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit bg-clip-text bg-gradient-to-tr from-white to-slate-400">
                        Emergency Override Console
                    </h1>
                    <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Critical Queue Control Panel
                    </p>
                </div>
            </div>

            {/* Error or Success banners */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Form: Find and Fast-Track Patient */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel border-rose-500/20 rounded-3xl p-6 relative overflow-hidden glow-rose">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-rose-600/10 blur-2xl"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Insert Emergency Patient</h3>
                        <p className="text-xs text-slate-400 mt-2">
                            Enter the patient's name or medical card ID below to locate their record and bypass the waiting list.
                        </p>

                        <div className="mt-5 space-y-3.5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && searchPatients()}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-semibold"
                                />
                                <button
                                    onClick={searchPatients}
                                    className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer"
                                >
                                    Find
                                </button>
                            </div>

                            {searchLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {searchResults.map((p) => (
                                        <div
                                            key={p._id}
                                            className="p-3 bg-slate-800/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-left"
                                        >
                                            <div className="overflow-hidden">
                                                <span className="text-xs font-bold text-slate-200 block truncate">{p.fullName}</span>
                                                <span className="text-[9px] text-slate-500 font-medium block">Card: {p.medicalCardNumber || "N/A"}</span>
                                            </div>
                                            <button
                                                onClick={() => triggerFastTrack(p._id)}
                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-[9px] font-bold text-white transition glow-rose cursor-pointer flex-shrink-0"
                                            >
                                                Fast-Track
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery && !searchLoading ? (
                                <p className="text-[10px] text-slate-500 text-center py-3">No patients found. Try a different query.</p>
                            ) : null}
                        </div>
                    </div>

                    {/* Operational Protocols */}
                    <div className="glass-card p-5 rounded-2xl space-y-3">
                        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Safety Protocols</span>
                        <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                            <p>1. Fast-track override places the selected patient at **Position #1** in the active queue.</p>
                            <p>2. SMS and email alerts are sent to next-in-line patients regarding estimated time shifts.</p>
                            <p>3. An audit log is automatically registered for this override action.</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Current Critical Patients List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold font-outfit text-white">Active Fast-Tracked Emergency Patients</h3>
                            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-bold text-rose-400 flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Live Critical Feed
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                <div className="w-7 h-7 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs">Loading critical patient tracking...</p>
                            </div>
                        ) : criticalQueue.length === 0 ? (
                            <p className="text-xs text-slate-500 py-16 text-center">No active emergency override cases in the queue.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/80">
                                {criticalQueue.map((item) => (
                                    <div
                                        key={item._id}
                                        className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-slate-200">
                                                    Token #{item.tokenNumber}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-xs font-semibold text-slate-300">
                                                    {item.patient?.fullName || "Emergency Walk-in"}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-500 text-white uppercase tracking-wider animate-pulse">
                                                    EMERGENCY
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
                                                <span>Age/Sex: {item.patient?.age || "N/A"}y / {item.patient?.gender || "N/A"}</span>
                                                <span>•</span>
                                                <span className="text-rose-400">Symptoms: {item.patient?.symptoms || "Critical"}</span>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex-shrink-0 flex sm:flex-col justify-between sm:justify-center gap-2 items-center sm:items-end">
                                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 block">
                                                Queue Pos: 1
                                            </span>
                                            <span className="text-[10px] text-rose-400 font-semibold block">
                                                Direct to Doctor: {item.doctor?.fullName || "Any Doctor Available"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
export default EmergencyDashboard;
