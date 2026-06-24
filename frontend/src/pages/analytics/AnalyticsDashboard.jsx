import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { api } from "../../services/api/apiService.js";

export const AnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [queueStats, setQueueStats] = useState(null);
    const [dailyReports, setDailyReports] = useState(null);
    const [doctorPerf, setDoctorPerf] = useState([]);
    const [patientStats, setPatientStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [mRes, qRes, dRes, dpRes, psRes] = await Promise.all([
                    api.get("/analytics/metrics"),
                    api.get("/analytics/queue-stats"),
                    api.get("/analytics/daily-reports"),
                    api.get("/analytics/doctor-performance"),
                    api.get("/analytics/patient-stats")
                ]);
                setMetrics(mRes.metrics);
                setQueueStats(qRes.queueStats);
                setDailyReports(dRes.dailyReports);
                setDoctorPerf(dpRes.doctorPerformance || []);
                setPatientStats(psRes.patientStats);
            } catch (err) {
                console.error("Analytics load error", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Simple SVG bar chart renderer
    const BarChart = ({ data, labelKey, valueKey, color = "#3b82f6", maxHeight = 120 }) => {
        if (!data || data.length === 0) return <p className="text-xs text-slate-500 text-center py-4">No data</p>;
        const maxVal = Math.max(...data.map(d => d[valueKey] || d.count || 0), 1);
        return (
            <div className="flex items-end gap-2 justify-center" style={{ height: maxHeight + 30 }}>
                {data.map((item, i) => {
                    const val = item[valueKey] || item.count || 0;
                    const h = (val / maxVal) * maxHeight;
                    const label = item[labelKey] || item._id || `Item ${i}`;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                            <span className="text-[9px] font-bold text-slate-300">{val}</span>
                            <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: h, backgroundColor: color, opacity: 0.8, minHeight: 4 }}></div>
                            <span className="text-[8px] text-slate-500 font-semibold truncate max-w-full text-center">{String(label).slice(-5)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Aggregating analytics...</p>
                </div>
            </DashboardLayout>
        );
    }

    const statCards = metrics ? [
        { label: "Total Patients", value: metrics.totalPatients, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Active Queue", value: metrics.activeQueue, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Consulting Now", value: metrics.consultingPatients, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Completed", value: metrics.completedConsultations, color: "text-violet-400", bg: "bg-violet-500/10" },
        { label: "Total Doctors", value: metrics.totalDoctors, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { label: "Appointments", value: metrics.totalAppointments, color: "text-rose-400", bg: "bg-rose-500/10" },
    ] : [];

    return (
        <DashboardLayout>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5 text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{card.label}</span>
                        <h2 className={`text-3xl font-black font-outfit mt-2 ${card.color}`}>{card.value}</h2>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Queue Status Distribution */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Queue Status Distribution</h3>
                    {queueStats && queueStats.statusStats && (
                        <div className="space-y-3">
                            {Object.entries(queueStats.statusStats).map(([status, count]) => {
                                const total = Object.values(queueStats.statusStats).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                const colorMap = { WAITING: "#f59e0b", CONSULTING: "#3b82f6", COMPLETED: "#10b981" };
                                return (
                                    <div key={status} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-300 font-semibold">{status}</span>
                                            <span className="text-slate-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: colorMap[status] || "#6366f1" }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-3 border-t border-slate-800/60">
                                <p className="text-xs text-slate-500">Avg Wait Time: <span className="font-bold text-blue-400">{queueStats.avgWaitTime} mins</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Patient Priority Distribution */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Patient Priority Distribution</h3>
                    {queueStats && queueStats.priorityStats && (
                        <div className="space-y-3">
                            {Object.entries(queueStats.priorityStats).map(([priority, count]) => {
                                const total = Object.values(queueStats.priorityStats).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                const colorMap = { EMERGENCY: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#eab308", LOW: "#3b82f6" };
                                return (
                                    <div key={priority} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-300 font-semibold">{priority}</span>
                                            <span className="text-slate-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: colorMap[priority] || "#6366f1" }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Daily Registrations Chart */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Daily Patient Registrations (7 Days)</h3>
                    <BarChart data={dailyReports?.dailyRegistrations} labelKey="_id" valueKey="count" color="#3b82f6" />
                </div>

                {/* Daily Appointments Chart */}
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Daily Appointments (7 Days)</h3>
                    <BarChart data={dailyReports?.dailyAppointments} labelKey="_id" valueKey="count" color="#10b981" />
                </div>
            </div>

            {/* Doctor Performance Table */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-sm font-bold font-outfit text-white mb-6">Doctor Performance Leaderboard</h3>
                {doctorPerf.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No doctor performance data available yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
                                    <th className="py-3 text-left font-bold">Doctor</th>
                                    <th className="py-3 text-left font-bold">Specialization</th>
                                    <th className="py-3 text-center font-bold">Total Appts</th>
                                    <th className="py-3 text-center font-bold">Completed</th>
                                    <th className="py-3 text-center font-bold">Cancelled</th>
                                    <th className="py-3 text-right font-bold">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {doctorPerf.slice(0, 15).map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="py-3 font-semibold text-slate-200">{doc.doctorName}</td>
                                        <td className="py-3 text-slate-400">{doc.specialization}</td>
                                        <td className="py-3 text-center text-slate-300">{doc.totalAppointments}</td>
                                        <td className="py-3 text-center text-emerald-400 font-bold">{doc.completedAppointments}</td>
                                        <td className="py-3 text-center text-rose-400">{doc.cancelledAppointments}</td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                doc.completionRate >= 75 ? "bg-emerald-500/10 text-emerald-400" :
                                                doc.completionRate >= 50 ? "bg-amber-500/10 text-amber-400" :
                                                "bg-rose-500/10 text-rose-400"
                                            }`}>{doc.completionRate}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Patient Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Gender Distribution</h3>
                    {patientStats?.genderStats && (
                        <div className="flex items-center justify-center gap-8">
                            {Object.entries(patientStats.genderStats).map(([gender, count]) => (
                                <div key={gender} className="text-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black font-outfit text-white border-4 border-slate-800 mx-auto" style={{
                                        borderColor: gender === "Male" ? "#3b82f6" : gender === "Female" ? "#ec4899" : "#8b5cf6"
                                    }}>{count}</div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 block">{gender}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold font-outfit text-white mb-6">Blood Group Distribution</h3>
                    {patientStats?.bloodGroupStats && Object.keys(patientStats.bloodGroupStats).length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(patientStats.bloodGroupStats).map(([bg, count]) => (
                                <div key={bg} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-center">
                                    <span className="text-lg font-black text-rose-400 font-outfit">{bg}</span>
                                    <span className="text-[10px] text-slate-500 block mt-1 font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-xs text-slate-500 text-center py-4">No blood group data</p>}
                </div>
            </div>
        </DashboardLayout>
    );
};
export default AnalyticsDashboard;
