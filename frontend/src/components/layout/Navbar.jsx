import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "../../routes/AppRoutes.jsx";
import { useState, useEffect } from "react";
import { socketListener } from "../../services/socket/socketService.js";

export const Navbar = () => {
    const { user } = useAuth();
    const { currentPath, navigate } = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Handle socket notifications
        const handleTokenCalled = (data) => {
            const message = `🔔 Token #${data.tokenNumber} called for Dr. ${data.doctorName || "consultation"}`;
            setNotifications(prev => [message, ...prev.slice(0, 4)]);
        };

        const handlePatientRegistered = (data) => {
            const message = `👶 Patient ${data.fullName} checked in. Assigned Token #${data.tokenNumber}`;
            setNotifications(prev => [message, ...prev.slice(0, 4)]);
        };

        socketListener.on("tokenCalled", handleTokenCalled);
        socketListener.on("patientRegistered", handlePatientRegistered);

        return () => {
            socketListener.off("tokenCalled", handleTokenCalled);
            socketListener.off("patientRegistered", handlePatientRegistered);
        };
    }, []);

    if (!user) return null;

    const getTitle = () => {
        const path = currentPath;
        if (path === "/dashboard") return `Welcome, ${user.fullName}`;
        if (path === "/analytics") return "Analytics & Reports";
        if (path === "/emergency") return "Emergency Priority Room";
        if (path === "/hospital") return "Hospital Operations";
        if (path === "/profile") return "Account Profile";
        if (path === "/settings") return "Settings & Control Panel";
        return "QueueCure Dashboard";
    };

    return (
        <header className="h-20 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
            <div>
                <h1 className="text-xl font-bold font-outfit text-white tracking-wide">{getTitle()}</h1>
                <p className="text-xs text-slate-500 font-medium">Real-time Hospital Telemetry Active</p>
            </div>

            <div className="flex items-center gap-6">
                {/* Public display link */}
                <button
                    onClick={() => window.open("/queue", "_blank")}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all duration-300 cursor-pointer"
                >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Launch Lobby Screen</span>
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800/50 flex items-center justify-center relative transition-all duration-300 cursor-pointer"
                    >
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse"></span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-40">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-2">
                                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Live Alerts</span>
                                {notifications.length > 0 && (
                                    <button onClick={() => setNotifications([])} className="text-[10px] text-blue-500 hover:underline">Clear all</button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-4">No new alerts received</p>
                                ) : (
                                    notifications.map((msg, idx) => (
                                        <div key={idx} className="p-2.5 bg-slate-850/50 rounded-lg border border-slate-800/40 text-[11px] text-slate-300 leading-normal">
                                            {msg}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Connection Indicator */}
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/25 ring-2 ring-slate-950"></span>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Sync On</span>
                </div>
            </div>
        </header>
    );
};
export default Navbar;
