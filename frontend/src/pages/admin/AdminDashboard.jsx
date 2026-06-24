import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";

export const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            setError("");
            const [metricsRes, usersRes] = await Promise.all([
                api.get("/admin/metrics"),
                api.get("/admin/users")
            ]);

            if (metricsRes.success && metricsRes.metrics) {
                setMetrics(metricsRes.metrics);
            }
            if (usersRes.success && usersRes.users) {
                setUsers(usersRes.users);
            }
        } catch (err) {
            console.error("Failed to load admin panel data", err);
            setError("Failed to fetch admin stats. Ensure you are signed in as an administrator.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        try {
            const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            if (res.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                setError(res.message || "Failed to update role.");
            }
        } catch (err) {
            setError(err.message || "Error changing user role.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleToggleStatus = async (userId) => {
        setUpdatingUserId(userId);
        try {
            const res = await api.put(`/admin/users/${userId}/status`);
            if (res.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isActive: res.isActive } : u));
            } else {
                setError(res.message || "Failed to toggle user status.");
            }
        } catch (err) {
            setError(err.message || "Error toggling user status.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        setUpdatingUserId(userId);
        try {
            const res = await api.delete(`/admin/users/${userId}`);
            if (res.success) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                setError(res.message || "Failed to delete user.");
            }
        } catch (err) {
            setError(err.message || "Error deleting user.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Format uptime helper
    const formatUptime = (seconds) => {
        if (!seconds) return "0s";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Loading System Diagnostics...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit bg-clip-text bg-gradient-to-tr from-white to-slate-400">
                        Admin Command Center
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                        System telemetry, resource counters, and user credentials
                    </p>
                </div>
                <button
                    onClick={loadAdminData}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                    </svg>
                    Refresh Telemetry
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Diagnostic Metrics */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* CPU & Memory */}
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-blue">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Server Memory</span>
                        <div className="mt-4 flex items-end gap-2">
                            <h2 className="text-3xl font-black font-outfit text-white leading-none">
                                {metrics.telemetry?.usedMemoryGB} GB
                            </h2>
                            <span className="text-xs text-slate-500 font-bold mb-1">
                                / {metrics.telemetry?.totalMemoryGB} GB
                            </span>
                        </div>
                        {/* Memory Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                            <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${metrics.telemetry?.memoryUsagePercent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                            <span>Usage</span>
                            <span className="text-blue-400">{metrics.telemetry?.memoryUsagePercent}%</span>
                        </div>
                    </div>

                    {/* CPU Load */}
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-purple">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">CPU Load (1m Avg)</span>
                        <h2 className="text-4xl font-black font-outfit text-white mt-4 leading-none">
                            {metrics.telemetry?.cpuLoad}
                        </h2>
                        <p className="text-[10px] text-slate-500 mt-3 font-semibold">
                            Uptime: {formatUptime(metrics.telemetry?.uptimeSeconds)}
                        </p>
                    </div>

                    {/* Database Telemetry */}
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-emerald">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Database Connection</span>
                        <h2 className="text-2xl font-black font-outfit text-emerald-400 mt-4 leading-none flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {metrics.database?.status}
                        </h2>
                        <p className="text-[10px] text-slate-500 mt-3 font-semibold uppercase tracking-wider">
                            Database: {metrics.database?.name}
                        </p>
                    </div>

                    {/* Document Volumes */}
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glow-amber">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Record Registry Volume</span>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                                <span className="text-[8px] text-slate-500 font-bold block uppercase">Users</span>
                                <span className="text-sm font-bold text-white block mt-0.5">{metrics.database?.counters?.users || 0}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                                <span className="text-[8px] text-slate-500 font-bold block uppercase">Patients</span>
                                <span className="text-sm font-bold text-white block mt-0.5">{metrics.database?.counters?.patients || 0}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                                <span className="text-[8px] text-slate-500 font-bold block uppercase">Tickets</span>
                                <span className="text-sm font-bold text-white block mt-0.5">{metrics.database?.counters?.queues || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Management Directory */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-base font-bold font-outfit text-white">System User Directory</h3>
                        <p className="text-xs text-slate-500 mt-1">Assign access roles, view register dates and activate/suspend sessions</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Filter by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                        <svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 font-semibold">User Details</th>
                                <th className="pb-3 font-semibold">System Email</th>
                                <th className="pb-3 font-semibold">Access Role</th>
                                <th className="pb-3 font-semibold">Active Status</th>
                                <th className="pb-3 font-semibold text-right">Administrative Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredUsers.map((item) => (
                                <tr key={item._id} className="align-middle hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400">
                                                {item.fullName?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-200 block">{item.fullName}</span>
                                                <span className="text-[10px] text-slate-500 font-medium block">ID: {item._id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 font-semibold text-slate-300">{item.email}</td>
                                    <td className="py-4">
                                        <select
                                            disabled={updatingUserId === item._id}
                                            value={item.role}
                                            onChange={(e) => handleRoleChange(item._id, e.target.value)}
                                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-blue-400 font-bold focus:outline-none cursor-pointer"
                                        >
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="DOCTOR">DOCTOR</option>
                                            <option value="RECEPTIONIST">RECEPTIONIST</option>
                                            <option value="PATIENT">PATIENT</option>
                                        </select>
                                    </td>
                                    <td className="py-4">
                                        <button
                                            disabled={updatingUserId === item._id}
                                            onClick={() => handleToggleStatus(item._id)}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                                item.isActive !== false
                                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                            }`}
                                        >
                                            {item.isActive !== false ? "Active" : "Suspended"}
                                        </button>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            disabled={updatingUserId === item._id}
                                            onClick={() => handleDeleteUser(item._id)}
                                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
                                            title="Delete User Credentials"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};
export default AdminDashboard;
