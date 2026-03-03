import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, X, Bell } from "lucide-react";
import { useContext, useState } from "react";
import { EmployeeContext } from "../context/EmployeeContext";


const AppointmentReminder = () => {
  const [isVisible, setIsVisible] = useState(true);
  const {upcomingAppointments} = useContext(EmployeeContext);
 

  // Sample upcoming appointment (would come from your API/state)
  const upcomingAppointmentInfo = { 
    location: "BeautyHub Downtown", 
    address: "Ronald Ngala Street, RNG Plaza, 1st Floor, Shop No.203"
  };
  const upcomingAppointment = upcomingAppointments?.[0];

  // Only show if appointment is within 24 hours
  const shouldShowReminder = upcomingAppointment && upcomingAppointment.hours_until <= 24;

  if (!shouldShowReminder || !isVisible) return null;

  

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      onClick={() => setIsVisible(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-br from-[#D4AA7D] via-[#EFD09E] to-[#D4AA7D] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-w-3xl w-full"
      >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#272727] rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#272727] rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-[#272727]/10 rounded-full transition z-10"
      >
        <X className="w-5 h-5 text-[#272727]" />
      </button>

      {/* Bell Icon */}
      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          animate={{ rotate: [0, -15, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: 2, delay: 0.5 }}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 bg-[#272727]/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-[#272727]/30">
            <Bell className="w-6 h-6 text-[#272727]" />
          </div>
        </motion.div>

        <div className="flex-1">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#272727] mb-1 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Upcoming Appointment
            </h2>
            <p className="text-[#272727]/80 text-sm">
              Your appointment is in {upcomingAppointment.hours_until} hours
            </p>
          </div>

          {/* Appointment Details */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#272727] mb-2">
              {upcomingAppointment.service}
            </h3>
            <p className="text-[#272727]/80 mb-4">
              with {upcomingAppointment.employee_full_name}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-[#272727]">
                <div className="flex-shrink-0 w-8 h-8 bg-[#272727]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm sm:text-base">{upcomingAppointment.date}, {upcomingAppointment.time}</span>
              </div>

              <div className="flex items-center gap-3 text-[#272727]">
                <div className="flex-shrink-0 w-8 h-8 bg-[#272727]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm sm:text-base">{upcomingAppointment.duration}</span>
              </div>

              <div className="flex items-center gap-3 text-[#272727] sm:col-span-2">
                <div className="flex-shrink-0 w-8 h-8 bg-[#272727]/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm sm:text-base">{upcomingAppointmentInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={handleReschedule}
              className="flex-1 bg-[#272727] text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#272727]/90 transition shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reschedule
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex-1 bg-transparent text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-red-500/20 transition border-2 border-[#272727]/40 hover:border-red-500/40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div> */}
        </div>
      </div>
     </motion.div>
    </div>
  );
};

export default AppointmentReminder;