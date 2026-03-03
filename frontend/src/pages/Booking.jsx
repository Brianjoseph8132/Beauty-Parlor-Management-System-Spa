import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import salon from "../assets/images/salon1.jpeg";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, CreditCard, Briefcase } from "lucide-react";
import { BookingContext } from "../context/BookingContext";
import { useLocation, useNavigate } from "react-router-dom";

const Booking = () => {
  const [viewMode, setViewMode] = useState("week"); // "week" or "month"
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  const { slots, setServiceId, setDate, createBooking,fetchBookingPreview,clearBookingPreview,bookingPreview,previewError,previewLoading,rescheduleBooking } = useContext(BookingContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if it's a reschedule or a new booking
    if (!location.state?.serviceId && !location.state?.rescheduleId) {
      navigate("/service");
    }
  }, [location.state, navigate]);



  const { 
    serviceId, 
    title, 
    duration, 
    price,
    rescheduleId 
  } = location.state || {};

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // console.log("SETTING SERVICE ID:", serviceId);
    setServiceId(serviceId);
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate) return;

    // Format date in local timezone (YYYY-MM-DD)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // console.log("SETTING DATE:", formattedDate);
    setDate(formattedDate);
  }, [selectedDate]);


  // Fetch booking preview when date and time slot are selected
  useEffect(() => {
    if (selectedDate && selectedSlot && serviceId) {
      const formattedDate = formatLocalDate(selectedDate); 
      
      fetchBookingPreview({
        serviceId: serviceId,
        date: formattedDate,
        startTime: selectedSlot.start_time,
        employeeId: selectedSlot.employee_id || null,
      });
    }
  }, [selectedDate, selectedSlot, serviceId]);;

  // Clear preview when component unmounts
  useEffect(() => {
    return () => {
      clearBookingPreview();
    };
  }, [clearBookingPreview]);



  // Booking details
  const bookingDetails = {
    employee: "Poplar Beauty Salon",
    tier: "Premium",
    location: "Poplar beauty place",
    address: "1 Poplar Street, Noordwyk, Midrand, South Africa",
    service: "Gelish Overlay (Toes) French or Art",
    duration: "1h 30min",
    price: "R280.00",
  };

  const allSlots = [
    ...(slots?.morning || []),
    ...(slots?.afternoon || []),
    ...(slots?.evening || []),
  ];



  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getWeekDays = (startDate) => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday (changed from +2)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleTimeSlotClick = (slot) => {
    const label = `${slot.start_time} - ${slot.end_time}`;
    setSelectedTime(label);
    setSelectedSlot(slot);
  };

  const weekDays = getWeekDays(currentWeekStart);
  const monthDays = getDaysInMonth(selectedDate);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !serviceId || !selectedDate) return;

    try {
      const formattedDate = formatLocalDate(selectedDate); 

      // Check if this is a reschedule or new booking
      if (rescheduleId) {
        await rescheduleBooking({
          bookingId: rescheduleId,
          date: formattedDate,
          startTime: selectedSlot.start_time,
          employeeId: selectedSlot.employee_id || null,
        });
        
        alert("Appointment rescheduled successfully!");
        navigate("/history");
      } else {
        await createBooking({
          serviceId,
          date: formattedDate,
          startTime: selectedSlot.start_time,
          employeeId: selectedSlot.employee_id || null,
        });

        navigate("/booking-success");
      }
    } catch (error) {
      alert(error.message);
    }
  };


  const getEmployeeName = () => {
    // First priority: From booking preview API
    if (bookingPreview?.employee?.name) {
      return bookingPreview.employee.name;
    }
    // Second priority: From selected slot (available immediately)
    if (selectedSlot?.employee_name) {
      return selectedSlot.employee_name;
    }
    // Fallback: Default
    return "Poplar Beauty Salon";
  };

  const displayDetails = {
    employee: {
      name: getEmployeeName(),
      id: bookingPreview?.employee?.id || selectedSlot?.employee_id || null
    },
    service: {
      name: bookingPreview?.service?.name || title || "Service",
      duration: bookingPreview?.service?.duration || duration || "N/A",
      price: bookingPreview?.service?.price || price || "R0.00"
    },
    date_time: bookingPreview?.date_time,
    total_price: bookingPreview?.total_price || price || "R0.00"
  };

  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={salon}
          alt="Booking background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Section */}
          <div className="lg:col-span-2">
            <div className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AA7D]/30">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <button className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition">
                  <ArrowLeft className="w-6 h-6 text-[#EFD09E]" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#EFD09E]">
                  Choose Date & Time
                </h1>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    viewMode === "week"
                      ? "bg-[#D4AA7D] text-[#272727]"
                      : "bg-[#EFD09E]/10 text-[#EFD09E] hover:bg-[#EFD09E]/20 border border-[#D4AA7D]/30"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    viewMode === "month"
                      ? "bg-[#D4AA7D] text-[#272727]"
                      : "bg-[#EFD09E]/10 text-[#EFD09E] hover:bg-[#EFD09E]/20 border border-[#D4AA7D]/30"
                  }`}
                >
                  Month
                </button>
              </div>

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium text-[#EFD09E]">
                  {viewMode === "week"
                    ? `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}, ${weekDays[0].getFullYear()}`
                    : formatMonthYear(selectedDate)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewMode === "week" ? navigateWeek("prev") : navigateMonth("prev")}
                    className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#EFD09E]" />
                  </button>
                  <button
                    onClick={() => viewMode === "week" ? navigateWeek("next") : navigateMonth("next")}
                    className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                  >
                    <ChevronRight className="w-5 h-5 text-[#EFD09E]" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              {viewMode === "week" ? (
                // Week View
                <div className="grid grid-cols-7 gap-2 mb-8">
                  {dayNames.map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-[#EFD09E]/70 mb-2">{day}</div>
                      <motion.button
                        onClick={() => setSelectedDate(weekDays[index])}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg font-medium transition ${
                          isSelectedDate(weekDays[index])
                            ? "bg-[#D4AA7D] text-[#272727] border-2 border-[#D4AA7D] shadow-lg"
                            : "bg-[#EFD09E]/10 text-[#EFD09E] hover:bg-[#EFD09E]/20 border border-[#D4AA7D]/20"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {weekDays[index].getDate()}
                      </motion.button>
                    </div>
                  ))}
                </div>
              ) : (
                // Month View
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-[#EFD09E]/70 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-8">
                    {monthDays.map((date, index) => (
                      <motion.button
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        disabled={!date}
                        className={`aspect-square rounded-xl flex items-center justify-center text-lg font-medium transition ${
                          !date
                            ? "invisible"
                            : isSelectedDate(date)
                            ? "bg-[#D4AA7D] text-[#272727] border-2 border-[#D4AA7D] shadow-lg"
                            : "bg-[#EFD09E]/10 text-[#EFD09E] hover:bg-[#EFD09E]/20 border border-[#D4AA7D]/20"
                        }`}
                        whileHover={date ? { scale: 1.05 } : {}}
                        whileTap={date ? { scale: 0.95 } : {}}
                      >
                        {date ? date.getDate() : ""}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#EFD09E]">Choose Time</h2>
                  <div className="flex items-center gap-2 text-[#EFD09E]/70">
                    <span className="text-xl">🌍</span>
                    <span className="text-sm">Nairobi</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allSlots.map((slot) => {
                    const label = `${slot.start_time} - ${slot.end_time}`;
                    const isSelected = selectedTime === label;

                    return (
                      <motion.button
                        key={`${slot.start_time}-${slot.employee_id}`}
                        onClick={() => handleTimeSlotClick(slot)}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition ${
                          isSelected
                            ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                            : "bg-[#EFD09E]/10 text-[#EFD09E] hover:bg-[#EFD09E]/20 border border-[#D4AA7D]/20"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {label}
                      </motion.button>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>

          {/* Booking Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-[#D4AA7D]/30 sticky top-24">
              <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Booking Details</h2>

              {/* Employee */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-[#D4AA7D] mt-1" />
                  <div>
                    <p className="text-sm text-[#EFD09E]/70 mb-1">Employee</p>
                    <p className="font-semibold text-[#EFD09E]">{displayDetails.employee?.name || "Popular Beauty Salon"}</p>
                  </div>
                </div>
              </div>

              
              {/* <div className="mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AA7D] mt-1" />
                  <div>
                    <p className="text-sm text-[#EFD09E]/70 mb-1">Location</p>
                    <p className="font-semibold text-[#EFD09E]">{bookingDetails.location}</p>
                    <p className="text-sm text-[#EFD09E]/70">{bookingDetails.address}</p>
                  </div>
                </div>
              </div> */}

              {/* Service */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#D4AA7D] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-[#EFD09E]/70 mb-1">Service</p>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#EFD09E]">{displayDetails.service ?.name || title}</p>
                        <p className="text-sm text-[#EFD09E]/70">{displayDetails.service ?.duration ||duration}</p>
                      </div>
                      <p className="text-[#D4AA7D] font-bold">{displayDetails.service ?.price || price}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D4AA7D] mt-1" />
                  <div>
                    <p className="text-sm text-[#EFD09E]/70 mb-1">Date & Time</p>
                    <p className="font-semibold text-[#EFD09E]">
                      {bookingPreview?.date_time?.display || 
                        selectedDate.toLocaleDateString("en-US", { 
                          month: "long", 
                          day: "numeric", 
                          year: "numeric" 
                        })
                      }
                    </p>
                    {!bookingPreview && selectedTime && (
                      <p className="text-sm text-[#EFD09E]/70">{selectedTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="border-t border-[#D4AA7D]/30 pt-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-[#D4AA7D]" />
                  <p className="text-sm text-[#EFD09E]/70">Total Price</p>
                </div>
                <p className="text-3xl font-bold text-[#D4AA7D]">{displayDetails.total_price || price}</p>
              </div>

              {/* Book Button */}
              <motion.button
                onClick = {handleConfirmBooking}
                className="w-full bg-[#D4AA7D] text-[#272727] px-6 py-4 rounded-xl font-semibold text-lg hover:bg-[#272727] hover:text-[#EFD09E] transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {rescheduleId ? "Confirm Reschedule" : "Confirm Booking"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

