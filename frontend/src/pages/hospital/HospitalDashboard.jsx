import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";
import { useAuth } from "../../context/AuthContext.jsx";

export const HospitalDashboard = () => {
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState([]);
    const [stats, setStats] = useState({ totalHospitals: 0, totalCapacity: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Form fields for creating/editing hospital
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        address: "",
        contactNumber: "",
        capacity: 100,
        departments: "Emergency, Cardiology, Pediatrics, General Medicine, Orthopedics"
    });

    const loadHospitals = async () => {
        try {
            setLoading(true);
            const res = await api.get("/hospitals");
            if (res.success && res.hospitals) {
                setHospitals(res.hospitals);
                const capacity = res.hospitals.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
                setStats({
                    totalHospitals: res.hospitals.length,
                    totalCapacity: capacity
                });
            } else {
                setHospitals([]);
            }
        } catch (err) {
            console.error("Failed to load hospitals list", err);
            setError("Failed to fetch hospitals from backend. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHospitals();
    }, []);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity, 10),
                departments: formData.departments.split(",").map(d => d.trim()).filter(Boolean)
            };

            let res;
            if (selectedHospital) {
                // Update
                res = await api.put(`/hospitals/${selectedHospital._id}`, payload);
            } else {
                // Create
                res = await api.post("/hospitals", payload);
            }

            if (res.success) {
                setShowCreateModal(false);
                setSelectedHospital(null);
                setFormData({
                    name: "",
                    location: "",
                    address: "",
                    contactNumber: "",
                    capacity: 100,
                    departments: "Emergency, Cardiology, Pediatrics, General Medicine, Orthopedics"
                });
                loadHospitals();
            } else {
                setError(res.message || "Failed to save hospital.");
            }
        } catch (err) {
            setError(err.message || "An error occurred while saving the hospital details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hospital? This action is irreversible.")) return;
        try {
            const res = await api.delete(`/hospitals/${id}`);
            if (res.success) {
                loadHospitals();
            } else {
                setError(res.message || "Failed to delete hospital.");
            }
        } catch (err) {
            setError(err.message || "An error occurred while deleting the hospital.");
        }
    };

    const openEditModal = (hospital) => {
        setSelectedHospital(hospital);
        setFormData({
            name: hospital.name,
            location: hospital.location || "",
            address: hospital.address || "",
            contactNumber: hospital.contactNumber || "",
            capacity: hospital.capacity || 100,
            departments: Array.isArray(hospital.departments) ? hospital.departments.join(", ") : ""
        });
        setShowCreateModal(true);
    };

    const filteredHospitals = hospitals.filter(hospital => 
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit bg-clip-text bg-gradient-to-tr from-white to-slate-400">
                        Hospital Networks
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                        Manage hospitals, branches and bed capacities
                    </p>
                </div>
                {user?.role === "ADMIN" && (
                    <button
                        onClick={() => {
                            setSelectedHospital(null);
                            setFormData({
                                name: "",
                                location: "",
                                address: "",
                                contactNumber: "",
                                capacity: 100,
                                departments: "Emergency, Cardiology, Pediatrics, General Medicine, Orthopedics"
                            });
                            setShowCreateModal(true);
                        }}
                        className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Hospital
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-blue">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-600/10 blur-2xl"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Registered Hospitals</span>
                    <h2 className="text-4xl font-black font-outfit text-white mt-3 leading-none">{stats.totalHospitals}</h2>
                    <p className="text-[10px] text-slate-500 mt-2">Affiliated institutions linked to QueueCure network</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-emerald">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-600/10 blur-2xl"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Patient Capacity</span>
                    <h2 className="text-4xl font-black font-outfit text-white mt-3 leading-none">{stats.totalCapacity}</h2>
                    <p className="text-[10px] text-slate-500 mt-2">Combined patient bed capacity across all branches</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-purple col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-600/10 blur-2xl"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">System Status</span>
                    <h2 className="text-2xl font-black font-outfit text-white mt-3 leading-none flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Active Lobby
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-2">Smart Queue Routing is fully synchronized with socket feed</p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Showing {filteredHospitals.length} of {hospitals.length} records
                </span>
            </div>

            {/* Main Hospital Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Loading Hospital Data...</p>
                </div>
            ) : filteredHospitals.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl">
                    <p className="text-sm text-slate-400">No hospitals found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHospitals.map(hospital => (
                        <div key={hospital._id} className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold font-outfit text-white group-hover:text-blue-400 transition-colors">
                                        {hospital.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{hospital.location || "Not Specified"}</span>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-slate-800 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-300">
                                    Cap: {hospital.capacity}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                                <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Contact & Address</span>
                                    <p className="text-xs text-slate-300 font-semibold mt-1">{hospital.contactNumber || "N/A"}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 leading-normal">{hospital.address || "N/A"}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1.5">Specialized Departments</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(hospital.departments) && hospital.departments.map((dept, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800/80 rounded text-[9px] font-semibold text-blue-400">
                                                {dept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {user?.role === "ADMIN" && (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => openEditModal(hospital)}
                                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-800 text-[11px] font-bold text-slate-200 transition cursor-pointer text-center"
                                    >
                                        Edit Branch
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hospital._id)}
                                        className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 transition cursor-pointer text-center"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-panel border-slate-800/80 rounded-3xl w-full max-w-lg overflow-hidden relative glow-blue max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                            <h3 className="text-base font-bold font-outfit text-white">
                                {selectedHospital ? "Edit Hospital Details" : "Register New Hospital Branch"}
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Hospital Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. City General Hospital"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Location / City</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Downtown"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Capacity (Beds)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. 150"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 h-16 resize-none"
                                    placeholder="Full hospital street address..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Contact Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. +1 (555) 019-2834"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Departments (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.departments}
                                    onChange={(e) => setFormData({...formData, departments: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Emergency, Cardiology, Pediatrics..."
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800/60 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition glow-blue cursor-pointer"
                                >
                                    {selectedHospital ? "Save Changes" : "Create Branch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
export default HospitalDashboard;
