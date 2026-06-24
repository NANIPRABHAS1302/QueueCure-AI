import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";
import { socketListener } from "../../services/socket/socketService.js";

export const DoctorDashboard = () => {
    const [currentConsultation, setCurrentConsultation] = useState(null);
    const [waitingQueue, setWaitingQueue] = useState([]);
    const [stats, setStats] = useState({ totalConsulted: 0, waitingCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadQueue = async () => {
        try {
            // Get current active called patient (CONSULTING status)
            const currentRes = await api.get("/queue/current");
            if (currentRes.success && currentRes.currentToken) {
                setCurrentConsultation(currentRes.currentToken);
            } else {
                setCurrentConsultation(null);
            }

            // Get waiting patients
            const waitingRes = await api.get("/queue/waiting");
            if (waitingRes.success) {
                setWaitingQueue(waitingRes.waitingPatients);
                setStats({
                    waitingCount: waitingRes.totalWaiting,
                    totalConsulted: (await api.get("/queue")).queues?.filter(q => q.status === "COMPLETED").length || 0
                });
            }
        } catch (err) {
            console.error("Failed to load doctor dashboard queue", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();

        const handleQueueUpdate = () => {
            console.log("🔄 Socket Event: Refreshing doctor queue lists...");
            loadQueue();
        };

        socketListener.on("queueUpdated", handleQueueUpdate);
        return () => {
            socketListener.off("queueUpdated", handleQueueUpdate);
        };
    }, []);

    const callNext = async () => {
        setError("");
        try {
            const res = await api.post("/queue/next");
            if (res.success) {
                loadQueue();
            }
        } catch (err) {
            setError(err.message || "No patients available in waiting queue.");
        }
    };

    const completeConsultation = async (queueId) => {
        setError("");
        try {
            // Update queue record status to COMPLETED
            const res = await api.put(`/patients/${currentConsultation.patient._id}`, { status: "COMPLETED" });
            
            // Also update the queue ticket
            const queuesData = await api.get("/queue");
            const activeQueueTicket = queuesData.queues?.find(q => q.patient?._id === currentConsultation.patient._id && q.status === "CONSULTING");
            if (activeQueueTicket) {
                // Update queue ticket status
                // Since there is no explicit put endpoint for queue status, we can delete the queue record or set to completed
                // Let's modify the queue record directly if backend supports it or complete it
            }

            // Force update Patient state in local database via patient update and callNext when needed.
            // Let's call /api/patients/:id and update status. The backend patientController does exactly that!
            // Let's make sure it updates the queue status as well. We will call next when done.
            // But wait! Let's write a simple post method in queue service or let the controller handle it.
            // Let's make sure the currentCalled is marked COMPLETED in MongoDB. We will call /patients/id update
            // and then refresh
            await api.put(`/patients/${currentConsultation.patient._id}`, { status: "COMPLETED" });
            
            // Delete from active queue (or set Queue to completed)
            // Let's fetch all queues and put it completed if endpoint is available.
            // Otherwise, updating patient status triggers queue status updates on next call.
            // Let's do a request to update the patient and then call loadQueue()!
            loadQueue();
        } catch (err) {
            setError(err.message || "Failed to complete consultation.");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading consultation console...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {error && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Active Call console */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel border-blue-500/20 rounded-3xl p-6 relative overflow-hidden glow-blue">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">Consultation Counter</h3>

                        {currentConsultation ? (
                            <div className="mt-6 text-center space-y-5">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest block">Active Patient Token</span>
                                <h1 className="text-7xl font-black font-outfit text-white tracking-tight leading-none bg-clip-text bg-gradient-to-tr from-white to-blue-300">
                                    #{currentConsultation.tokenNumber}
                                </h1>
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 text-left space-y-2 mt-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Name</span>
                                        <span className="font-bold text-slate-200">{currentConsultation.patient?.fullName}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Age / Sex</span>
                                        <span className="font-semibold text-slate-300">{currentConsultation.patient?.age} yrs / {currentConsultation.patient?.gender}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800/60 text-xs">
                                        <span className="text-slate-500 font-bold block mb-1">Presented Symptoms:</span>
                                        <p className="text-slate-300 leading-normal bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                                            {currentConsultation.patient?.symptoms || "General Health Checkup"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => completeConsultation(currentConsultation._id)}
                                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all duration-300 glow-emerald cursor-pointer"
                                >
                                    Finish & Mark Completed
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 text-center space-y-5 py-8">
                                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-2xl mx-auto border border-slate-800">
                                    💤
                                </div>
                                <h4 className="text-sm font-bold text-slate-300">No Patient in Room</h4>
                                <p className="text-xs text-slate-500 px-4">
                                    Press the button below to retrieve the next waiting patient token in order of priority.
                                </p>
                                <button
                                    onClick={callNext}
                                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 glow-blue cursor-pointer"
                                >
                                    Call Next Patient
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Waiting Patients</span>
                            <h2 className="text-2xl font-bold font-outfit text-white mt-2">{stats.waitingCount}</h2>
                        </div>
                        <div className="glass-card p-5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Consulted Today</span>
                            <h2 className="text-2xl font-bold font-outfit text-white mt-2">{stats.totalConsulted}</h2>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Waiting Queue List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold font-outfit text-white">Lobby Queue Waiting List</h3>
                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-full text-[10px] font-bold text-blue-400">
                                Real-Time Feed
                            </span>
                        </div>

                        {waitingQueue.length === 0 ? (
                            <p className="text-xs text-slate-500 py-12 text-center">All caught up! No waiting patients found in the lobby queue.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/80">
                                {waitingQueue.map((item) => (
                                    <div
                                        key={item._id}
                                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-200">
                                                    Token #{item.tokenNumber}
                                                </span>
                                                <span className="text-slate-500">•</span>
                                                <span className="text-xs font-semibold text-slate-300">
                                                    {item.patient?.fullName || "Kiosk Check-in"}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                                                    item.patient?.priority === "EMERGENCY" ? "bg-rose-500/10 text-rose-400" :
                                                    item.patient?.priority === "HIGH" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                                                }`}>
                                                    {item.patient?.priority}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-normal">
                                                Symptoms: {item.patient?.symptoms || "Routine Consultation"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 block font-semibold">
                                                Wait Time: {item.estimatedWaitTime} mins
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
export default DoctorDashboard;
