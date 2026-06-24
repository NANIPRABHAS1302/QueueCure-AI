import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";
import { socketListener } from "../../services/socket/socketService.js";

export const ReceptionistDashboard = () => {
    const [waitingQueue, setWaitingQueue] = useState([]);
    const [currentToken, setCurrentToken] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Patient registration form
    const [form, setForm] = useState({
        fullName: "", age: "", gender: "Male", phone: "", email: "",
        bloodGroup: "", address: "", symptoms: "", priority: "LOW"
    });

    const loadQueue = async () => {
        try {
            const [currentRes, waitingRes, docsRes] = await Promise.all([
                api.get("/queue/current"),
                api.get("/queue/waiting"),
                api.get("/doctors")
            ]);
            setCurrentToken(currentRes.currentToken || null);
            setWaitingQueue(waitingRes.waitingPatients || []);
            setDoctors(docsRes.doctors || []);
        } catch (err) {
            console.error("Failed to load receptionist data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
        const refresh = () => loadQueue();
        socketListener.on("queueUpdated", refresh);
        socketListener.on("patientRegistered", refresh);
        return () => {
            socketListener.off("queueUpdated", refresh);
            socketListener.off("patientRegistered", refresh);
        };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        setSubmitLoading(true);
        try {
            const res = await api.post("/receptionist/register", {
                ...form,
                age: Number(form.age)
            });
            if (res.success) {
                setSuccess(`Patient registered! Token #${res.queue?.tokenNumber || "assigned"}. SMS/Email alerts dispatched.`);
                setForm({ fullName: "", age: "", gender: "Male", phone: "", email: "", bloodGroup: "", address: "", symptoms: "", priority: "LOW" });
                loadQueue();
            }
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setSubmitLoading(false);
        }
    };

    const callNext = async () => {
        setError("");
        try {
            await api.post("/queue/next");
            loadQueue();
        } catch (err) {
            setError(err.message || "No patients in queue.");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading reception console...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 mb-4">{error}</div>
            )}
            {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-4">{success}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Current Token + Call Next */}
                <div className="space-y-6">
                    <div className="glass-panel border-blue-500/20 rounded-3xl p-6 glow-blue text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">Active Token</h3>
                        {currentToken ? (
                            <div className="mt-4 space-y-3">
                                <h1 className="text-6xl font-black font-outfit text-white">#{currentToken.tokenNumber}</h1>
                                <p className="text-xs text-slate-300">{currentToken.patient?.fullName || "Patient"}</p>
                                <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full">{currentToken.status}</span>
                            </div>
                        ) : (
                            <div className="mt-6 py-4">
                                <p className="text-sm text-slate-500">No active consultation</p>
                            </div>
                        )}
                        <button onClick={callNext} className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all glow-blue cursor-pointer">
                            📢 Call Next Patient
                        </button>
                    </div>

                    {/* Queue counter */}
                    <div className="glass-card rounded-2xl p-5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Patients Waiting</span>
                        <h2 className="text-3xl font-bold font-outfit text-white mt-2">{waitingQueue.length}</h2>
                    </div>

                    {/* Available Doctors */}
                    <div className="glass-card rounded-2xl p-5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">On-Duty Doctors</span>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {doctors.filter(d => d.isAvailable).slice(0, 8).map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between text-xs py-1.5">
                                    <span className="text-slate-300 font-semibold">{doc.fullName}</span>
                                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{doc.specialization}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center + Right: Registration Form */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-3xl p-8">
                        <h3 className="text-sm font-bold font-outfit text-white mb-6">Walk-in Patient Registration & Queue Assignment</h3>

                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Full Name *</label>
                                <input name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Patient Full Name"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Age *</label>
                                    <input name="age" type="number" required value={form.age} onChange={handleChange} placeholder="Age"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Gender *</label>
                                    <select name="gender" value={form.gender} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Phone *</label>
                                <input name="phone" required value={form.phone} onChange={handleChange} placeholder="+1-555-0144"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="patient@email.com"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Blood Group</label>
                                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs">
                                    <option value="">Select</option>
                                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Priority Level</label>
                                <select name="priority" value={form.priority} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs">
                                    <option value="LOW">LOW - Routine</option>
                                    <option value="MEDIUM">MEDIUM - Moderate</option>
                                    <option value="HIGH">HIGH - Urgent</option>
                                    <option value="EMERGENCY">EMERGENCY - Critical</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Symptoms / Chief Complaint *</label>
                                <input name="symptoms" required value={form.symptoms} onChange={handleChange} placeholder="Describe chief complaint..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Address</label>
                                <input name="address" value={form.address} onChange={handleChange} placeholder="Street address"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs placeholder-slate-600" />
                            </div>
                            <div className="md:col-span-2 pt-2">
                                <button type="submit" disabled={submitLoading}
                                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all glow-emerald cursor-pointer disabled:opacity-50">
                                    {submitLoading ? "Processing..." : "Register Patient & Generate Token"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Waiting list table */}
                    <div className="glass-card rounded-3xl p-6 mt-6">
                        <h3 className="text-sm font-bold font-outfit text-white mb-4">Current Waiting Queue</h3>
                        {waitingQueue.length === 0 ? (
                            <p className="text-xs text-slate-500 py-8 text-center">Queue is empty — all patients have been served.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
                                            <th className="py-3 text-left font-bold">Token</th>
                                            <th className="py-3 text-left font-bold">Patient</th>
                                            <th className="py-3 text-left font-bold">Priority</th>
                                            <th className="py-3 text-left font-bold">Symptoms</th>
                                            <th className="py-3 text-right font-bold">Wait (min)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {waitingQueue.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-bold text-white">#{item.tokenNumber}</td>
                                                <td className="py-3 text-slate-300">{item.patient?.fullName || "Unknown"}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                        item.patient?.priority === "EMERGENCY" ? "bg-rose-500/10 text-rose-400" :
                                                        item.patient?.priority === "HIGH" ? "bg-amber-500/10 text-amber-400" :
                                                        item.patient?.priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                                                        "bg-blue-500/10 text-blue-400"
                                                    }`}>{item.patient?.priority || "LOW"}</span>
                                                </td>
                                                <td className="py-3 text-slate-400 max-w-[180px] truncate">{item.patient?.symptoms}</td>
                                                <td className="py-3 text-right text-slate-300 font-semibold">{item.estimatedWaitTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
export default ReceptionistDashboard;
