import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import ChatbotWidget from "../../components/chatbot/ChatbotWidget.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api/apiService.js";
import { socketListener } from "../../services/socket/socketService.js";

export const PatientDashboard = () => {
    const { user } = useAuth();
    const [patientInfo, setPatientInfo] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form fields for appointment booking
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");
    const [bookingError, setBookingError] = useState("");

    const loadData = async () => {
        try {
            // Find patient matching logged-in user phone
            const patientsData = await api.get("/patients");
            const matchedPatient = patientsData.patients.find(
                (p) => p.phone === user.phone || p.email === user.email
            );

            if (matchedPatient) {
                setPatientInfo(matchedPatient);

                // Fetch appointments for this patient
                const apptsData = await api.get("/appointments");
                const matchedAppts = apptsData.appointments.filter(
                    (appt) => appt.patient?._id === matchedPatient._id
                );
                setAppointments(matchedAppts);
            }

            // Fetch doctors list
            const docsData = await api.get("/doctors");
            setDoctors(docsData.doctors);

        } catch (err) {
            console.error("Error loading patient data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Socket listeners to auto-refresh queue numbers
        const refreshQueue = () => {
            console.log("🔄 Socket Event: Refreshing patient dashboard queue...");
            loadData();
        };

        socketListener.on("queueUpdated", refreshQueue);
        socketListener.on("tokenCalled", refreshQueue);

        return () => {
            socketListener.off("queueUpdated", refreshQueue);
            socketListener.off("tokenCalled", refreshQueue);
        };
    }, []);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setBookingSuccess("");
        setBookingError("");

        if (!patientInfo) {
            setBookingError("No registered patient profile found for this user account.");
            return;
        }

        try {
            const data = {
                patient: patientInfo._id,
                doctor: selectedDoctor || null,
                appointmentDate: new Date(appointmentDate),
                status: "PENDING"
            };

            const res = await api.post("/appointments", data);
            if (res.success || res.appointment) {
                setBookingSuccess("Appointment requested successfully! Confirmations will be sent via SMS/Email.");
                setSelectedDoctor("");
                setAppointmentDate("");
                loadData();
            }
        } catch (err) {
            setBookingError(err.message || "Failed to book appointment");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading patient records...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Token Card and Queue Tracker */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel border-blue-500/20 rounded-3xl p-6 relative overflow-hidden glow-blue">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500">Live Kiosk Ticket</h3>
                        
                        {patientInfo && patientInfo.status === "IN_QUEUE" ? (
                            <div className="mt-6 text-center space-y-4">
                                <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold block">Your Active Token</span>
                                <h1 className="text-6xl font-black font-outfit text-white tracking-tight leading-none bg-clip-text bg-gradient-to-tr from-white to-blue-300">
                                    #{patientInfo.tokenNumber}
                                </h1>
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
                                    <div className="text-left">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Queue Position</span>
                                        <p className="text-xl font-bold text-white mt-1">#{patientInfo.queuePosition}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Wait</span>
                                        <p className="text-xl font-bold text-blue-400 mt-1">{patientInfo.estimatedWaitTime}m</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[11px] text-blue-400 font-semibold flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                                    <span>Monitoring live kiosk updates...</span>
                                </div>
                            </div>
                        ) : patientInfo && patientInfo.status === "CONSULTING" ? (
                            <div className="mt-6 text-center space-y-4 py-4">
                                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider block">Currently Consulting</span>
                                <h1 className="text-5xl font-black font-outfit text-white">Called</h1>
                                <p className="text-xs text-slate-300 px-4 leading-relaxed">
                                    Your token is being called. Please proceed directly to the designated consulting office.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 text-center space-y-4 py-8">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl mx-auto">
                                    💤
                                </div>
                                <h4 className="text-sm font-bold text-slate-300">No Active Queue Ticket</h4>
                                <p className="text-xs text-slate-500 px-4">
                                    Check in at the reception desk or ask the virtual bot for symptom mapping to get a ticket.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Patient Profile Summary */}
                    <div className="glass-card rounded-3xl p-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Details</h4>
                        {patientInfo ? (
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-800/40">
                                    <span className="text-slate-500">Full Name</span>
                                    <span className="font-semibold text-slate-300">{patientInfo.fullName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/40">
                                    <span className="text-slate-500">Patient ID</span>
                                    <span className="font-mono font-semibold text-blue-400">{patientInfo.patientId}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/40">
                                    <span className="text-slate-500">Contact Phone</span>
                                    <span className="font-semibold text-slate-300">{patientInfo.phone}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/40">
                                    <span className="text-slate-500">Blood Group</span>
                                    <span className="font-bold text-rose-500">{patientInfo.bloodGroup || "Not Specified"}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Active Priority</span>
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                        patientInfo.priority === "EMERGENCY" ? "bg-rose-500/10 text-rose-400" :
                                        patientInfo.priority === "HIGH" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                                    }`}>{patientInfo.priority}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 leading-normal">
                                Your account is not currently linked to an active Patient profile. Please register at the reception counter to unlock full queue capabilities.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Panel: Book Appointment and History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Book Appointment Form */}
                    <div className="glass-card rounded-3xl p-6">
                        <h3 className="text-sm font-bold font-outfit text-white mb-6">Schedule Consultation</h3>

                        {bookingSuccess && (
                            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                                {bookingSuccess}
                            </div>
                        )}

                        {bookingError && (
                            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
                                {bookingError}
                            </div>
                        )}

                        <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Select Specialist / Doctor
                                </label>
                                <select
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-905 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs"
                                >
                                    <option value="">Choose Doctor (General Clinic)</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.fullName} ({doc.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                                    Appointment Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-905 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-xs"
                                />
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-blue-500/10 cursor-pointer"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Appointments list */}
                    <div className="glass-card rounded-3xl p-6">
                        <h3 className="text-sm font-bold font-outfit text-white mb-6">Upcoming Scheduled Appointments</h3>

                        {appointments.length === 0 ? (
                            <p className="text-xs text-slate-500 py-6 text-center">No scheduled appointments found.</p>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appt) => (
                                    <div
                                        key={appt._id}
                                        className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800 flex justify-between items-center"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-100">
                                                {appt.doctor?.fullName || "General Practitioner"}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                                                {appt.doctor?.specialization || "General Medicine"}
                                            </span>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                Date: {new Date(appt.appointmentDate).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${
                                                appt.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400" :
                                                appt.status === "PENDING" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chatbot Panel integration */}
            <ChatbotWidget />
        </DashboardLayout>
    );
};
export default PatientDashboard;
