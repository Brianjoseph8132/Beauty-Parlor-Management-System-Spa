import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { User, Clock, LogIn, LogOut, UserX, Search, Filter,Calendar,TrendingUp,CheckCircle,XCircle,AlertCircle} from "lucide-react";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeeAttendance = () => {
  const {scheduledToday, checkInEmployee, checkOutEmployee, todaySummary, absentEmployee,fetchTodayAttendance, attendanceRecords } = useContext(EmployeeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8;

  const statusOptions = ["All", "Active", "Inactive"];

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Handle Check In
  const handleCheckIn = async (employeeId) => {
    try {
      await checkInEmployee(employeeId);
      fetchTodayAttendance();
    } catch (e) {}
  };


  // Handle Check Out
  const handleCheckOut = async (employeeId) => {
    try {
      await checkOutEmployee(employeeId);
      fetchTodayAttendance();
    } catch (e) {}
  };



  // Handle Mark Absent
  const handleMarkAbsent = async (employeeId) => {
    try {
      await absentEmployee(employeeId);
      fetchTodayAttendance();
    } catch (e) {}
  };


  const isAutoAbsent = (employee, attendance) => { 
    if (!employee.is_active) return false;

    const now = new Date(); 
    const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format 
    // If no attendance record OR no check_in, and current time is past work_end 
    if ((!attendance || !attendance.checkIn) && currentTime > employee.work_end) { 
      return true; 
    } 
    return false; 
  };



  // Get attendance status for employee
  const getAttendanceStatus = (employeeId) => {
    return attendanceRecords?.[employeeId] || null;
  };

  // Filter employees
    const filteredEmployees = (scheduledToday || []).filter((employee) => {
        const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && employee.is_active) ||
        (statusFilter === "Inactive" && !employee.is_active);
        const matchesSearch =
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate statistics
  const totalEmployees = scheduledToday.filter((e) => e.is_active).length;
  const checkedIn = Object.values(attendanceRecords).filter(
    (record) => record.status === "checked_in" || record.status === "checked_out"
  ).length;
  const absent = Object.values(attendanceRecords).filter(
    (record) => record.status === "absent"
  ).length;
  const pending = totalEmployees - checkedIn - absent;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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
            Employee <span className="text-[#D4AA7D]">Attendance</span>
          </h1>
          <div className="flex items-center gap-2 text-lg text-[#272727]/70">
            <Calendar className="w-5 h-5 text-[#D4AA7D]" />
            {today}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Employees */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-[#D4AA7D]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {todaySummary?.scheduled_today_count || 0}
            </h3>
            <p className="text-sm text-[#272727]/60">Total Active Employees</p>
          </div>

          {/* Checked In */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {todaySummary?.present_today || 0}
            </h3>
            <p className="text-sm text-[#272727]/60">Present Today</p>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">{todaySummary?.absent_today || 0}</h3>
            <p className="text-sm text-[#272727]/60">Absent Today</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">{todaySummary?.pending_check_in || 0}</h3>
            <p className="text-sm text-[#272727]/60">Pending Check-in</p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search employees by name or username..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-[#272727]/70 flex-shrink-0" />
              {statusOptions.map((status) => (
                <motion.button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    statusFilter === status
                      ? "bg-[#D4AA7D] text-[#272727]"
                      : "bg-[#EFD09E]/50 text-[#272727] hover:bg-[#EFD09E]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Employees Grid */}
        {currentEmployees.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {currentEmployees.map((employee, index) => {
              const attendance = getAttendanceStatus(employee.id);
              const isCheckedIn = attendance?.status === "checked_in";
              const isCheckedOut = attendance?.status === "checked_out";
              const isAbsent = attendance?.status === "Absent";
              const autoAbsent = isAutoAbsent(employee, attendance); // Add this line

              return (
                <motion.div
                  key={employee.id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  {/* Employee Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 bg-[#D4AA7D] rounded-full flex items-center justify-center flex-shrink-0">
                      {employee.employee_profile_picture ? (
                        <img
                          src={employee.employee_profile_picture}
                          alt={employee.full_name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <User
                        className="w-8 h-8 text-[#272727]"
                        style={{
                          display: employee.employee_profile_picture
                            ? "none"
                            : "block",
                        }}
                      />
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#272727] mb-1">
                        {employee.full_name}
                      </h3>
                      <p className="text-sm text-[#272727]/60 mb-2">
                        @{employee.username}
                      </p>

                      {/* Active Status */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            employee.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <span
                          className={`text-xs font-medium ${
                            employee.is_active
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Attendance Status Badge */}
                    {attendance && attendance.status !== "pending" && (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          isCheckedIn || isCheckedOut
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : "bg-red-500/20 text-red-600 border-red-500/30"
                        }`}
                      >
                        {isCheckedIn && "Checked In"}
                        {isCheckedOut && "Checked Out"}
                        {isAbsent && "Absent"}
                      </div>
                    )}
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-[#EFD09E]/30 rounded-xl">
                    <Clock className="w-5 h-5 text-[#D4AA7D]" />
                    <div className="flex-1">
                      <p className="text-xs text-[#272727]/60 mb-1">
                        Working Hours
                      </p>
                      <p className="text-sm font-semibold text-[#272727]">
                        {employee.work_start} - {employee.work_end}
                      </p>
                    </div>
                  </div>

                  {/* Check-in/Check-out Times */}
                  {(attendance?.checkIn || attendance?.checkOut) && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {attendance.checkIn && (
                        <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                          <p className="text-xs text-green-600/70 mb-1">
                            Check-in Time
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {attendance.checkIn}
                          </p>
                        </div>
                      )}
                      {attendance.checkOut && (
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <p className="text-xs text-blue-600/70 mb-1">
                            Check-out Time
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            {attendance.checkOut}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {attendance?.status === "pending" && !autoAbsent && (
                      <>
                        <motion.button
                          onClick={() => handleCheckIn(employee.id)}
                          disabled={!employee.is_active}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: employee.is_active ? 1.02 : 1 }}
                          whileTap={{ scale: employee.is_active ? 0.98 : 1 }}
                        >
                          <LogIn className="w-4 h-4" />
                          Check In
                        </motion.button>
                        <motion.button
                          onClick={() => handleMarkAbsent(employee.id)}
                          disabled={
                            !employee.is_active ||
                            isCheckedIn ||
                            isCheckedOut ||
                            isAbsent
                          }
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: employee.is_active ? 1.02 : 1 }}
                          whileTap={{ scale: employee.is_active ? 0.98 : 1 }}
                        >
                          <UserX className="w-4 h-4" />
                          Absent
                        </motion.button>
                      </>
                    )}

                    {isCheckedIn && (
                      <motion.button
                        onClick={() => handleCheckOut(employee.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#D4AA7D] text-[#272727] px-4 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </motion.button>
                    )}

                    {isCheckedOut && (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-semibold border border-gray-200">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    )}

                    {isAbsent && (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-xl font-semibold border border-red-200">
                        <XCircle className="w-4 h-4" />
                        Marked Absent
                      </div>
                    )}

                    {/* Shift ended, no check-in, no explicit absent mark */}
                    {autoAbsent && !isAbsent && (
                      <motion.button
                       onClick={() => handleMarkAbsent(employee.id)}
                       disabled={!employee.is_active}
                       className="flex-1 items-center justify-center gap-2 bg-orange-100 text-orange-600 px-4 py-3 rounded-xl font-semibold border border-orange-200 hover:bg-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                       whileHover={{ scale: employee.is_active ? 1.02 : 1 }}
                       whileTap={{scale: employee.is_active ? 0.98 : 1 }}
                      >
                        <AlertCircle className="w-4 h-4"/>
                        Absent (Auto)
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-[#272727]/60 text-lg">No employees found</p>
          </div>
        )}

        {/* Pagination */}
        {filteredEmployees.length > employeesPerPage && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mt-8"
          >
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => {
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
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
                  return (
                    <span key={pageNumber} className="text-[#272727]/50">
                      ...
                    </span>
                  );
                }
                return null;
              }
            )}

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
          </motion.div>
        )}

        {/* Page Info */}
        {filteredEmployees.length > 0 && (
          <p className="text-center mt-6 text-[#272727]/60 text-sm">
            Showing {indexOfFirstEmployee + 1}-
            {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} employees
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;