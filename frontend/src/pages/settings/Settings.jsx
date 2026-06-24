import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

export const Settings = () => {
    const [notifications, setNotifications] = useState({
        smsEnabled: true,
        emailEnabled: true,
        queueAlerts: true,
        marketingAlerts: false
    });
    const [security, setSecurity] = useState({
        twoFactor: false,
        sessionTimeout: "30"
    });
    const [successMessage, setSuccessMessage] = useState("");

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSuccessMessage("Configuration saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    return (
        <DashboardLayout>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white font-outfit bg-clip-text bg-gradient-to-tr from-white to-slate-400">
                    System Settings & Configuration
                </h1>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Set communication channels, privacy preferences, and alert policies
                </p>
            </div>

            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notification Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold font-outfit text-white mb-4">Notification Channels</h3>
                        <p className="text-xs text-slate-400 mb-6">Choose how the hospital system should communicate status updates and queue changes.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">SMS Queue Dispatch Alerts</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Receive text messages when your token is called by a practitioner.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.smsEnabled}
                                    onChange={(e) => setNotifications({ ...notifications, smsEnabled: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">Email Reminders & Receipts</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Receive medical booking summaries and receptionist check-in tokens.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.emailEnabled}
                                    onChange={(e) => setNotifications({ ...notifications, emailEnabled: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">Live Chatbot Interactions</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Record chatbot symptom diagnostics to clinical database history.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifications.queueAlerts}
                                    onChange={(e) => setNotifications({ ...notifications, queueAlerts: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security and Session Preference */}
                    <div className="glass-panel border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold font-outfit text-white mb-4">Security Preferences</h3>
                        <p className="text-xs text-slate-400 mb-6">Manage session length, timeouts and authentication verification methods.</p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">Secure 2-Factor Authentication</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Require an OTP verification code sent via SMS during session logins.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={security.twoFactor}
                                    onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 gap-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">Session Inactivity Timeout</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Define after how many minutes of idle time the portal automatically signs out.</span>
                                </div>
                                <select
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="120">120 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Save Button Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl space-y-4">
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Operational Status</span>
                        <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                            <p>All settings are synchronized locally and saved dynamically across database parameters.</p>
                            <p>SMS integrations are powered by Twilio endpoints, and Email deliveries use verified SMTP channels.</p>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 glow-blue cursor-pointer"
                        >
                            Save Settings Profile
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};
export default Settings;
