import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { Calendar, Clock, DollarSign, User, AlertTriangle, Search, Filter, Play, CheckCircle, MailCheck, MailX } from "lucide-react";
import { EmployeeContext } from "../context/EmployeeContext";

const Appointments = () => {
 
  const {employeeAppointments, startService, completeService} = useContext(EmployeeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const statusOptions = ["All", "Confirmed", "In Progress", "Completed"];

  const isPastBooking = (booking) => {
    const now = new Date();

    // Combine booking.date and booking.start_time into a single Date object
    const [year, month, day] = booking.date.split("-").map(Number);
    const [hours, minutes] = booking.start_time.split(":").map(Number);

    const bookingDateTime = new Date(year, month - 1, day, hours, minutes);

    // Add 24 hours (in milliseconds) to the booking time
    const bookingDateTimePlus24Hours = new Date(bookingDateTime.getTime() + (24 * 60 * 60 * 1000));

    // Only consider it past if it's been more than 24 hours since the appointment start time
    return now > bookingDateTimePlus24Hours;
  };


  // Filter appointments
  const filteredAppointments = employeeAppointments.filter((appointment) => {
    const matchesStatus = statusFilter === "All" || 
      appointment.booking.status.toLowerCase() === statusFilter.toLowerCase().replace(" ", "_");
    const matchesSearch = 
      appointment.client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleStartAppointment = (bookingId) => {
  //   setAppointments(
  //     appointments.map((appointment) =>
  //       appointment.booking.id === bookingId
  //         ? {
  //             ...appointment,
  //             booking: { ...appointment.booking, status: "in_progress" }
  //           }
  //         : appointment
  //     )
  //   );
  // };

  // const handleCompleteAppointment = (bookingId) => {
  //   setAppointments(
  //     appointments.map((appointment) =>
  //       appointment.booking.id === bookingId
  //         ? {
  //             ...appointment,
  //             booking: { ...appointment.booking, status: "completed" }
  //           }
  //         : appointment
  //     )
  //   );
  // };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rescheduled":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

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
            My <span className="text-[#D4AA7D]">Appointments</span>
          </h1>
          <p className="text-lg text-[#272727]/70">
            Manage your upcoming and past appointments
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search by client or service..."
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

        {/* Appointments List */}
        <div className="space-y-6">
          {currentAppointments.length > 0 ? (
            currentAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.booking.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Client & Service Info */}
                  <div className="flex-1 space-y-4">
                    {/* Client Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#D4AA7D] rounded-full flex items-center justify-center flex-shrink-0">
                        {appointment.client.profile_picture ? (
                          <img
                            src={appointment.client.profile_picture}
                            alt={appointment.client.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-[#272727]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-[#272727]">
                              {appointment.service.title}
                            </h3>
                            <p className="text-sm text-[#272727]/60">
                              Client: @{appointment.client.username}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.booking.status)}`}>
                            {appointment.booking.status.replace("_", " ").toUpperCase()}
                          </div>
                        </div>

                        {/* Date, Time & Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-[#272727]/80">
                            <Calendar className="w-4 h-4 text-[#D4AA7D]" />
                            <span className="text-sm">{appointment.booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#272727]/80">
                            <Clock className="w-4 h-4 text-[#D4AA7D]" />
                            <span className="text-sm">
                              {appointment.booking.start_time} - {appointment.booking.end_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#272727]/80">
                            <Clock className="w-4 h-4 text-[#D4AA7D]" />
                            <span className="text-sm">
                              {formatDuration(appointment.service.duration_minutes)}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-[#D4AA7D]" />
                          <span className="text-2xl font-bold text-[#D4AA7D]">
                            KSH{appointment.booking.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Allergies */}
                        {appointment.client.allergies.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-700 mb-2">
                                  Client Allergies:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {appointment.client.allergies.map((allergy) => (
                                    <span
                                      key={allergy.id}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                                    >
                                      {allergy.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="lg:w-48 flex lg:flex-col gap-3">
                    {(appointment.booking.status === "confirmed" || appointment.booking.status === "rescheduled") && !isPastBooking(appointment.booking) && (
                      <motion.button
                          onClick={() => startService(appointment.booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#D4AA7D] text-[#272727] px-4 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                      >
                          <Play className="w-4 h-4" />
                          Start
                      </motion.button>
                    )}



                    {appointment.booking.status === "in_progress" && (
                      <motion.button
                        onClick={() => completeService(appointment.booking.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </motion.button>
                    )}

                    {appointment.booking.status === "completed" && (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                          appointment.booking.receipt_sent
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : "bg-red-500/20 text-red-600 border-red-500/30"
                        }`}
                      >
                        {appointment.booking.receipt_sent ? (
                          <MailCheck className="w-4 h-4" />
                        ) : (
                          <MailX className="w-4 h-4" />
                        )}
                        {appointment.booking.receipt_sent ? "Receipt Sent" : "Receipt Failed"}
                      </span>
                    )}

                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="text-[#272727]/60 text-lg">
                No appointments found
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAppointments.length > appointmentsPerPage && (
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
          </motion.div>
        )}

        {/* Page Info */}
        {filteredAppointments.length > 0 && (
          <p className="text-center mt-6 text-[#272727]/60 text-sm">
            Showing {indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
          </p>
        )}
      </div>
    </div>
  );
};

export default Appointments;