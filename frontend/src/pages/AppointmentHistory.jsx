import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { Calendar, Clock, MapPin, DollarSign, Search, Filter, Download, Eye, X, CheckCircle, XCircle, Clock3, RefreshCw, Ban } from "lucide-react";
import { BookingContext } from "../context/BookingContext";
import { ServiceContext } from "../context/ServiceContext";
import { useNavigate } from "react-router-dom";

const AppointmentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const navigate = useNavigate(); 

  const { appointments, setAppointments, cancelBooking, rescheduleBooking } = useContext(BookingContext);
  const { downloadReceipt } = useContext(ServiceContext);
  const appointmentsPerPage = 6;

  const mappedAppointments = appointments.map((b) => ({
    id: b.id,
    confirmationNumber: `BPMS-${b.id}`,
    service: b.service_name,
    employee: b.employee_name,
    date: new Date(b.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    rawDate: b.date, // Keep raw date for rescheduling
    time: `${b.start_time} - ${b.end_time}`,
    startTime: b.start_time,
    endTime: b.end_time,
    duration: `${b.duration} min`,
    location: "Poplar beauty place",
    address: "Ronald Ngala Street, RNG Plaza, 1st Floor, Shop No.203",
    price: `KES ${b.price.toFixed(2)}`,
    status: b.status,
    serviceId: b.service_id,
    employeeId: b.employee_id,
  }));

  const statusOptions = ["All", "Upcoming", "completed", "cancelled", "rescheduled"];

  // Map backend status to display status
  const getDisplayStatus = (backendStatus) => {
    if (backendStatus.toLowerCase() === "confirmed") {
      return "Upcoming";
    }
    return backendStatus;
  };

  const handleDownloadReceipt = async (bookingId) => {
    await downloadReceipt(bookingId);
  };

  // Handle Cancel Appointment
  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    
    try {
      await cancelBooking(appointmentToCancel.id);
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      // Optionally close detail modal if open
      if (selectedAppointment?.id === appointmentToCancel.id) {
        setSelectedAppointment(null);
      }
    } catch (error) {
      alert("Failed to cancel appointment: " + error.message);
    }
  };

  // Handle Reschedule Appointment
  const handleReschedule = (appointment) => {
    // Navigate to booking page with appointment data for rescheduling
    // window.location.href = `/book?reschedule=${appointment.id}`;
    // Or use navigate if you have it from useNavigate()
    navigate(`/book`, { 
      state: { 
        rescheduleId: appointment.id,
        serviceId: appointment.serviceId,
        title: appointment.service,
        duration: appointment.duration,
        price: appointment.price
      }
    });
  };


  
  const isPastAppointment = (appointment) => {
    const now = new Date();
    
    // Parse the date string (format: "Month Day, Year")
    const appointmentDate = new Date(appointment.rawDate);
    
    // Parse the end time to check if the appointment has fully passed
    const [endHours, endMinutes] = appointment.endTime.split(":").map(Number);
    appointmentDate.setHours(endHours, endMinutes);
    
    return appointmentDate < now;
  };

  // Filter appointments
  const filteredAppointments = mappedAppointments.filter((appointment) => {
    const displayStatus = getDisplayStatus(appointment.status);
    const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;
    const matchesSearch = 
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.employee.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getStatusIcon = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case "Upcoming":
        return <Clock3 className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "rescheduled":
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case "Upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "rescheduled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "";
    }
  };

  // Check if appointment is upcoming/confirmed
  const isUpcoming = (status) => {
    return status.toLowerCase() === "confirmed" || getDisplayStatus(status) === "Upcoming";
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
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#272727] mb-2">
            Appointment <span className="text-[#D4AA7D]">History</span>
          </h1>
          <p className="text-lg text-[#272727]/70">
            View and manage all your past and upcoming appointments
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search by service, confirmation number, or employee..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-[#272727]/70" />
            <span className="text-sm font-medium text-[#272727]/70">Filter by:</span>
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
        </motion.div>

        {/* Appointments List */}
        {currentAppointments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {currentAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer"
                whileHover={{ y: -5 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#272727] mb-1">
                      {appointment.service}
                    </h3>
                    <p className="text-sm text-[#272727]/60">
                      {appointment.confirmationNumber}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {getDisplayStatus(appointment.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-[#272727]/80">
                    <Calendar className="w-4 h-4 text-[#D4AA7D]" />
                    <span className="text-sm">{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#272727]/80">
                    <Clock className="w-4 h-4 text-[#D4AA7D]" />
                    <span className="text-sm">{appointment.time} ({appointment.duration})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#272727]/80">
                    <MapPin className="w-4 h-4 text-[#D4AA7D]" />
                    <span className="text-sm">{appointment.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#272727]/80">
                    <DollarSign className="w-4 h-4 text-[#D4AA7D]" />
                    <span className="text-sm font-semibold">{appointment.price}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#D4AA7D]/20">
                  <motion.button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#EFD09E]/50 text-[#272727] rounded-lg font-medium text-sm hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>

                  {/* Show Reschedule & Cancel only for Upcoming appointments that are NOT past */}
                  {isUpcoming(appointment.status) && !isPastAppointment(appointment) && (
                    <>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReschedule(appointment);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-500/30 transition border border-blue-500/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelClick(appointment);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg font-medium text-sm hover:bg-red-500/30 transition border border-red-500/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Ban className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    </>
                  )}

                  {/* Show Download Receipt for Completed appointments */}
                  {appointment.status.toLowerCase() === "completed" && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReceipt(appointment.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AA7D] text-[#272727] rounded-lg font-medium text-sm hover:bg-[#272727] hover:text-[#EFD09E] transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      Receipt
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-[#272727]/60 text-lg">
              No appointments found matching your criteria
            </p>
          </div>
        )}

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
              className="px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            >
              ‹
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
              className="px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            >
              ›
            </motion.button>
          </motion.div>
        )}

        {/* Page Info */}
        {filteredAppointments.length > 0 && (
          <p className="text-center mt-6 text-[#272727]/60 text-sm">
            Page {currentPage} of {totalPages} ({filteredAppointments.length} appointments found)
          </p>
        )}
      </div>

      {/* Modal for Appointment Details */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedAppointment(null)}
              className="float-right p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
            >
              <X className="w-6 h-6 text-[#EFD09E]" />
            </button>

            <h2 className="text-3xl font-bold text-[#EFD09E] mb-2">
              Appointment Details
            </h2>
            <p className="text-[#EFD09E]/70 mb-6">{selectedAppointment.confirmationNumber}</p>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Service</p>
                <p className="text-xl font-semibold text-[#EFD09E]">{selectedAppointment.service}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#EFD09E]/70 mb-1">Date</p>
                  <p className="font-semibold text-[#EFD09E]">{selectedAppointment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-[#EFD09E]/70 mb-1">Time</p>
                  <p className="font-semibold text-[#EFD09E]">{selectedAppointment.time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Duration</p>
                <p className="font-semibold text-[#EFD09E]">{selectedAppointment.duration}</p>
              </div>

              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Employee</p>
                <p className="font-semibold text-[#EFD09E]">{selectedAppointment.employee}</p>
              </div>

              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Location</p>
                <p className="font-semibold text-[#EFD09E]">{selectedAppointment.location}</p>
                <p className="text-sm text-[#EFD09E]/70">{selectedAppointment.address}</p>
              </div>

              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Price</p>
                <p className="text-2xl font-bold text-[#D4AA7D]">{selectedAppointment.price}</p>
              </div>

              <div>
                <p className="text-sm text-[#EFD09E]/70 mb-1">Status</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusIcon(selectedAppointment.status)}
                  {getDisplayStatus(selectedAppointment.status)}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
            {/* Show Reschedule & Cancel only for Upcoming appointments that are NOT past */}
            {isUpcoming(selectedAppointment.status) && !isPastAppointment(selectedAppointment) && (
              <>
                <motion.button
                  onClick={() => {
                    handleReschedule(selectedAppointment);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reschedule
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleCancelClick(selectedAppointment);
                  }}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Ban className="w-4 h-4" />
                  Cancel Appointment
                </motion.button>
              </>
            )}

            {/* Show Download Receipt for Completed appointments */}
            {selectedAppointment.status.toLowerCase() === "completed" && (
              <motion.button
                onClick={() => handleDownloadReceipt(selectedAppointment.id)}
                className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Download Receipt
              </motion.button>
            )}

            {/* Always show Close button */}
            <motion.button
              onClick={() => setSelectedAppointment(null)}
              className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-[#D4AA7D]/30"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#EFD09E] mb-2">Cancel Appointment?</h3>
              <p className="text-[#EFD09E]/70">
                Are you sure you want to cancel this appointment for <strong>{appointmentToCancel.service}</strong> on {appointmentToCancel.date}?
              </p>
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                }}
                className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Keep Appointment
              </motion.button>
              <motion.button
                onClick={confirmCancel}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yes, Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;