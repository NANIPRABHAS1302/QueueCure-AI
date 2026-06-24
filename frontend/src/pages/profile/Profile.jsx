import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api/apiService.js";

export const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        // Doctor specific
        specialization: "",
        department: "",
        // Patient specific
        age: "",
        gender: "Male",
        medicalHistory: ""
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                specialization: user.specialization || "",
                department: user.department || "",
                age: user.age || "",
                gender: user.gender || "Male",
                medicalHistory: user.medicalHistory || ""
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        
        try {
            // First, update backend profile if role specific models exist,
            // or just update user credentials in context
            const payload = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber
            };

            if (user.role === "DOCTOR") {
                payload.specialization = formData.specialization;
                payload.department = formData.department;
            } else if (user.role === "PATIENT") {
                payload.age = parseInt(formData.age, 10);
                payload.gender = formData.gender;
                payload.medicalHistory = formData.medicalHistory;
            }

            // Sync with local context which updates local storage
            await updateProfile(payload);
            setSuccessMessage("Profile updated successfully!");
        } catch (err) {
            setErrorMessage(err.message || "Failed to update profile details.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <DashboardLayout>
                <p className="text-center text-slate-500 py-12 text-xs">Please sign in to view your profile dashboard.</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white font-outfit bg-clip-text bg-gradient-to-tr from-white to-slate-400">
                    Account Profile Info
                </h1>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Manage your credentials, practitioner fields, or personal medical registries
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
            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Details Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold font-outfit text-white mb-6">Personal Credentials</h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 focus:outline-none font-semibold cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Security Access Level</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user.role}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-blue-500 font-bold focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Practitioner Details (For Doctor only) */}
                    {user.role === "DOCTOR" && (
                        <div className="glass-panel border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
                            <h3 className="text-sm font-bold font-outfit text-white mb-6">Practitioner Specialty Details</h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Specialization</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.specialization}
                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                            placeholder="e.g. Cardiologist"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Practitioner Department</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                            placeholder="e.g. Cardiology Unit"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Patient Health Registry (For Patient only) */}
                    {user.role === "PATIENT" && (
                        <div className="glass-panel border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
                            <h3 className="text-sm font-bold font-outfit text-white mb-6">Patient Health Registry</h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Age (Years)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Medical History</label>
                                    <textarea
                                        value={formData.medicalHistory}
                                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                                        placeholder="Any chronic conditions, allergies, or previous surgeries..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Save Button Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl space-y-4">
                        <div className="flex flex-col items-center py-4">
                            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-blue-500/20 flex items-center justify-center font-bold text-slate-200 text-3xl mb-3 shadow-lg shadow-slate-950">
                                {user.fullName?.slice(0, 2).toUpperCase()}
                            </div>
                            <h4 className="text-sm font-bold text-white">{user.fullName}</h4>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 leading-relaxed">
                            <p>Verify that your details match your government identification or practitioner registration records.</p>
                            <p>For credentials adjustments like changing your registered email address, please contact the IT administration team.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 glow-blue cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            {loading ? "Updating Account Details..." : "Save Profile Details"}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};
export default Profile;
