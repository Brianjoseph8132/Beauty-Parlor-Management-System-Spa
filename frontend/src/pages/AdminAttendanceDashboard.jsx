import { motion } from "framer-motion";
import { useState, useMemo, useContext } from "react";
import {
    Users, CheckCircle, XCircle, Clock, TrendingUp,
    Search, ArrowUpDown, ChevronUp, ChevronDown
} from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { AttendanceContext } from "../context/AttendanceContext"; // adjust path as needed

const AdminAttendanceDashboard = () => {
    const {
        period,
        setPeriod,
        summary,
        attendanceData: rawData,
        loading,
    } = useContext(AttendanceContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: "attendancePercentage", direction: "desc" });
    const employeesPerPage = 6;

    const periodOptions = ["Today", "Week", "Month"];

    // --- FIELD MAPPING ---
    // Backend returns: employee_id, employee_name, avatar, days_present, days_absent, days_late, attendance_percent
    // Frontend expects: id, name, avatar, daysPresent, daysAbsent, daysLate, attendancePercentage, totalDays
    const processedData = useMemo(() => {
        if (!rawData) return [];
        return rawData.map((emp) => ({
            id: emp.employee_id,
            name: emp.employee_name,
            avatar: emp.avatar,
            daysPresent: emp.days_present,
            daysAbsent: emp.days_absent,
            daysLate: emp.days_late,
            totalDays: emp.days_present + emp.days_absent + emp.days_late,
            attendancePercentage: parseFloat(emp.attendance_percent).toFixed(1),
        }));
    }, [rawData]);

    // Use summary from backend instead of recalculating
    const totals = useMemo(() => ({
        totalEmployees: summary?.total_employees ?? 0,
        totalPresent: summary?.total_days_present ?? 0,
        totalAbsent: summary?.total_days_absent ?? 0,
        totalLate: summary?.total_days_late ?? 0,
        avgAttendance: summary?.average_attendance_percent?.toFixed(1) ?? "0.0",
    }), [summary]);

    // Sorting
    const sortedData = useMemo(() => {
        let sortableData = [...processedData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === "attendancePercentage") {
                    aValue = parseFloat(aValue);
                    bValue = parseFloat(bValue);
                }
                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [processedData, sortConfig]);

    // Filter
    const filteredData = useMemo(() => {
        return sortedData.filter((emp) =>
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedData, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / employeesPerPage);
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredData.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Period change handler — syncs with context
    const handlePeriodChange = (p) => {
        setPeriod(p.toLowerCase()); // context/backend expects lowercase
        setCurrentPage(1);
    };

    // Chart data
    const pieChartData = [
        { name: "Present", value: totals.totalPresent, color: "#10b981" },
        { name: "Absent", value: totals.totalAbsent, color: "#ef4444" },
        { name: "Late", value: totals.totalLate, color: "#f59e0b" },
    ];

    const barChartData = useMemo(() => {
        return [...processedData]
            .sort((a, b) => parseFloat(b.attendancePercentage) - parseFloat(a.attendancePercentage))
            .slice(0, 10)
            .map((emp) => ({
                name: emp.name?.split(" ")[0],
                present: emp.daysPresent,
                absent: emp.daysAbsent,
                late: emp.daysLate,
            }));
    }, [processedData]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = totals.totalPresent + totals.totalAbsent + totals.totalLate;
            return (
                <div className="bg-[#272727]/95 backdrop-blur-md border border-[#D4AA7D]/30 rounded-xl p-4 shadow-lg">
                    <p className="text-[#EFD09E] font-semibold mb-1">{payload[0].name}</p>
                    <p className="text-[#D4AA7D] font-bold text-lg">{payload[0].value} days</p>
                    <p className="text-[#EFD09E]/70 text-sm">
                        {total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
        return sortConfig.direction === "asc"
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />;
    };

    return (
        <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#272727] mb-2">
                        Attendance <span className="text-[#D4AA7D]">Dashboard</span>
                    </h1>
                    <p className="text-lg text-[#272727]/70">
                        Monitor and analyze employee attendance patterns
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    variants={fadeInUp} initial="hidden" animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#D4AA7D]" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#272727] mb-1">{totals.totalEmployees}</h3>
                        <p className="text-sm text-[#272727]/60">Total Employees</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-[#272727] mb-1">{totals.totalPresent}</h3>
                        <p className="text-sm text-[#272727]/60">Total Days Present</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#272727] mb-1">{totals.totalAbsent}</h3>
                        <p className="text-sm text-[#272727]/60">Total Days Absent</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#272727] mb-1">{totals.totalLate}</h3>
                        <p className="text-sm text-[#272727]/60">Total Days Late</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-[#272727] mb-1">{totals.avgAttendance}%</h3>
                        <p className="text-sm text-[#272727]/60">Avg Attendance</p>
                    </div>
                </motion.div>

                {/* Search and Period Filter */}
                <motion.div
                    variants={fadeInUp} initial="hidden" animate="visible"
                    className="bg-white rounded-2xl p-6 shadow-lg mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="relative flex-1 w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
                            <input
                                type="text"
                                placeholder="Search employee by name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
                            />
                        </div>

                        <div className="flex gap-2">
                            {periodOptions.map((p) => (
                                <motion.button
                                    key={p}
                                    onClick={() => handlePeriodChange(p)}
                                    // Match active state: context stores lowercase, p is capitalized
                                    className={`px-6 py-3 rounded-full font-medium text-sm transition ${
                                        period === p.toLowerCase()
                                            ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                                            : "bg-[#EFD09E]/50 text-[#272727] hover:bg-[#EFD09E]"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {p}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-[#D4AA7D] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Attendance Table */}
                {!loading && (
                    <motion.div
                        variants={fadeInUp} initial="hidden" animate="visible"
                        className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#D4AA7D] text-[#272727] sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Employee</th>
                                        <th className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-[#D4AA7D]/80 transition" onClick={() => handleSort("daysPresent")}>
                                            <div className="flex items-center justify-center gap-2">Days Present {getSortIcon("daysPresent")}</div>
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-[#D4AA7D]/80 transition" onClick={() => handleSort("daysAbsent")}>
                                            <div className="flex items-center justify-center gap-2">Days Absent {getSortIcon("daysAbsent")}</div>
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-[#D4AA7D]/80 transition" onClick={() => handleSort("daysLate")}>
                                            <div className="flex items-center justify-center gap-2">Days Late {getSortIcon("daysLate")}</div>
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#D4AA7D]/80 transition" onClick={() => handleSort("attendancePercentage")}>
                                            <div className="flex items-center gap-2">Attendance % {getSortIcon("attendancePercentage")}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEmployees.length > 0 ? (
                                        currentEmployees.map((employee, index) => (
                                            <motion.tr
                                                key={employee.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-[#D4AA7D]/20 hover:bg-[#EFD09E]/30 transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={employee.avatar}
                                                            alt={employee.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AA7D]"
                                                            onError={(e) => {
                                                                e.target.src = `https://via.placeholder.com/40?text=${employee.name?.charAt(0)}`;
                                                            }}
                                                        />
                                                        <span className="font-semibold text-[#272727]">{employee.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg font-semibold text-sm">{employee.daysPresent}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg font-semibold text-sm">{employee.daysAbsent}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-lg font-semibold text-sm">{employee.daysLate}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold text-[#272727] min-w-[45px]">{employee.attendancePercentage}%</span>
                                                        <div className="flex-1 bg-[#EFD09E]/30 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    parseFloat(employee.attendancePercentage) >= 90
                                                                        ? "bg-green-500"
                                                                        : parseFloat(employee.attendancePercentage) >= 75
                                                                        ? "bg-[#D4AA7D]"
                                                                        : "bg-red-500"
                                                                }`}
                                                                style={{ width: `${employee.attendancePercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-[#272727]/60">
                                                No attendance data found for selected period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredData.length > employeesPerPage && (
                            <div className="flex items-center justify-center gap-2 p-6 border-t border-[#D4AA7D]/20">
                                <motion.button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                >
                                    <span className="text-lg">‹</span>
                                    <span className="hidden sm:inline text-sm">Previous</span>
                                </motion.button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                                    if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                        return (
                                            <motion.button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                                    currentPage === pageNumber
                                                        ? "bg-[#D4AA7D] text-white shadow-lg"
                                                        : "bg-white border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20"
                                                }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {pageNumber}
                                            </motion.button>
                                        );
                                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                        return <span key={pageNumber} className="text-[#272727]/50">...</span>;
                                    }
                                    return null;
                                })}

                                <motion.button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                >
                                    <span className="hidden sm:inline text-sm">Next</span>
                                    <span className="text-lg">›</span>
                                </motion.button>
                            </div>
                        )}

                        {filteredData.length > 0 && (
                            <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
                                Showing {indexOfFirstEmployee + 1}–{Math.min(indexOfLastEmployee, filteredData.length)} of {filteredData.length} employees
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Charts */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-[#272727] mb-6">Overall Attendance Distribution</h2>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%" cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={100}
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[#272727] font-medium">{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-[#272727] mb-6">Attendance Comparison (Top 10)</h2>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#D4AA7D" opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fill: "#272727", fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                        <YAxis tick={{ fill: "#272727" }} />
                                        <Tooltip contentStyle={{ backgroundColor: "rgba(39,39,39,0.95)", border: "1px solid rgba(212,170,125,0.3)", borderRadius: "12px", color: "#EFD09E" }} />
                                        <Legend formatter={(value) => <span className="text-[#272727] font-medium capitalize">{value}</span>} />
                                        <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendanceDashboard;