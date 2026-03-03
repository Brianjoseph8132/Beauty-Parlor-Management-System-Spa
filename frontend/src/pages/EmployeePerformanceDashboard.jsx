import { motion } from "framer-motion";
import { useState, useMemo, useContext, useEffect } from "react";
import { Users, Calendar, CheckCircle, DollarSign, Search, TrendingUp, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DashboardContext } from "../context/DashboardContext";

const EmployeePerformanceDashboard = () => {
  const { 
    period, 
    setPeriod, 
    employees: employeeData, 
    summary,
    loading,
    error,
    refetch 
  } = useContext(DashboardContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  const periodOptions = [
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" }
  ];

  // Get totals from summary or calculate from employees
  const totals = useMemo(() => {
    if (summary) {
      return {
        totalClients: summary.total_clients,
        totalAppointments: summary.total_appointments,
        completedAppointments: summary.completed,
        totalRevenue: summary.total_revenue,
      };
    }
    // Fallback to calculation if summary not available
    const totalClients = employeeData.reduce((sum, emp) => sum + emp.completedAppointments, 0);
    const totalAppointments = employeeData.reduce((sum, emp) => sum + emp.totalAppointments, 0);
    const completedAppointments = employeeData.reduce((sum, emp) => sum + emp.completedAppointments, 0);
    const totalRevenue = employeeData.reduce((sum, emp) => sum + emp.totalRevenue, 0);

    return {
      totalClients,
      totalAppointments,
      completedAppointments,
      totalRevenue,
    };
  }, [employeeData, summary]);

  // Sort employees by revenue (already sorted by backend, but keep for consistency)
  const processedEmployeeData = useMemo(() => {
    return [...employeeData].sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [employeeData]);

  // Filter employees by search term
  const filteredEmployees = useMemo(() => {
    return processedEmployeeData.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedEmployeeData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  // Reset to page 1 when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  // Prepare pie chart data (excluding zero revenue employees)
  const pieChartData = useMemo(() => {
    return processedEmployeeData
      .filter((emp) => emp.totalRevenue > 0)
      .map((emp) => ({
        name: emp.name,
        value: emp.totalRevenue,
        percentage: emp.contributionPercent,
      }));
  }, [processedEmployeeData]);

  // Colors for pie chart
  const COLORS = ["#D4AA7D", "#EFD09E", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#272727]/95 backdrop-blur-md border border-[#D4AA7D]/30 rounded-xl p-4 shadow-lg">
          <p className="text-[#EFD09E] font-semibold mb-1">{payload[0].name}</p>
          <p className="text-[#D4AA7D] font-bold text-lg">KSH{payload[0].value.toFixed(2)}</p>
          <p className="text-[#EFD09E]/70 text-sm">{payload[0].payload.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#272727] mb-2">
            Employee <span className="text-[#D4AA7D]">Performance</span>
          </h1>
          <p className="text-lg text-[#272727]/70">
            Track and analyze employee productivity and revenue contribution
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#D4AA7D] animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-8">
            <p className="font-semibold">Error loading performance data</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => refetch(period)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Total Clients Served */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#D4AA7D]" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-[#272727] mb-1">
                  {totals.totalClients}
                </h3>
                <p className="text-sm text-[#272727]/60">Total Clients Served</p>
              </div>

              {/* Total Appointments */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#272727] mb-1">
                  {totals.totalAppointments}
                </h3>
                <p className="text-sm text-[#272727]/60">Total Appointments</p>
              </div>

              {/* Completed Appointments */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#272727] mb-1">
                  {totals.completedAppointments}
                </h3>
                <p className="text-sm text-[#272727]/60">Completed Appointments</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-[#272727] mb-1">
                  KSH{totals.totalRevenue.toFixed(2)}
                </h3>
                <p className="text-sm text-[#272727]/60">Total Revenue Generated</p>
              </div>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-6 shadow-lg mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search Input */}
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

                {/* Period Filter */}
                <div className="flex gap-2">
                  {periodOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handlePeriodChange(option.value)}
                      className={`px-6 py-3 rounded-full font-medium text-sm transition ${
                        period === option.value
                          ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                          : "bg-[#EFD09E]/50 text-[#272727] hover:bg-[#EFD09E]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Employee Performance Table */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#D4AA7D] text-[#272727] sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Employee</th>
                      <th className="px-6 py-4 text-center font-semibold">Total Appointments</th>
                      <th className="px-6 py-4 text-center font-semibold">Completed</th>
                      <th className="px-6 py-4 text-right font-semibold">Total Revenue</th>
                      <th className="px-6 py-4 text-left font-semibold">Contribution %</th>
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
                          {/* Employee Name & Avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={employee.avatar}
                                alt={employee.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AA7D]"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=D4AA7D&color=272727`;
                                }}
                              />
                              <span className="font-semibold text-[#272727]">
                                {employee.name}
                              </span>
                            </div>
                          </td>

                          {/* Total Appointments */}
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg font-semibold text-sm">
                              {employee.totalAppointments}
                            </span>
                          </td>

                          {/* Completed */}
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg font-semibold text-sm">
                              {employee.completedAppointments}
                            </span>
                          </td>

                          {/* Total Revenue */}
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-[#272727]">
                              KSH{employee.totalRevenue.toFixed(2)}
                            </span>
                          </td>

                          {/* Contribution % with Progress Bar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-[#272727] min-w-[45px]">
                                {employee.contributionPercent.toFixed(1)}%
                              </span>
                              <div className="flex-1 bg-[#EFD09E]/30 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-[#D4AA7D] h-full rounded-full transition-all duration-500"
                                  style={{ width: `${employee.contributionPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-[#272727]/60">
                          {searchTerm ? "No employees found matching your search." : "No performance data for selected period."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredEmployees.length > employeesPerPage && (
                <div className="flex items-center justify-center gap-2 p-6 border-t border-[#D4AA7D]/20">
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
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
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="text-[#272727]/50">...</span>;
                    }
                    return null;
                  })}

                  {/* Next Button */}
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

              {/* Page Info */}
              {filteredEmployees.length > 0 && (
                <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
                  Showing {indexOfFirstEmployee + 1}-{Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
                </div>
              )}
            </motion.div>

            {/* Revenue Contribution Chart */}
            {pieChartData.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-[#272727] mb-6">
                  Revenue Contribution by Employee
                </h2>
                <div className="w-full h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span className="text-[#272727] font-medium">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Empty State for Chart */}
            {pieChartData.length === 0 && filteredEmployees.length === 0 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl p-12 shadow-lg text-center"
              >
                <p className="text-[#272727]/60 text-lg">
                  No performance data for selected period.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeePerformanceDashboard;