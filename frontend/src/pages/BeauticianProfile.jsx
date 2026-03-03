import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Clock, Briefcase } from "lucide-react";
import { EmployeeContext } from "../context/EmployeeContext";


const BeauticianProfile = () => {
  
  const { getMyEmployeeProfile } = useContext(EmployeeContext);
  const [employee, setEmployee] = useState(null)


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyEmployeeProfile();
        if (profile) {
          setEmployee(profile);
        }
      } catch (error) {
        console.error("Failed to load employee profile", error);
      }
    };

    fetchProfile();
  }, []);

  

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Show loading state if employee data isn't loaded yet
  if (!employee) {
    return (
      <div className="min-h-screen bg-[#EFD09E] flex items-center justify-center">
        <div className="text-[#272727] text-xl font-semibold">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Profile Card */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-[#272727]/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-[#D4AA7D]/30"
        >
          <div className="relative p-8 pb-12">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AA7D] to-[#EFD09E] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={employee.employee_profile_picture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover relative z-10 border-4 border-[#D4AA7D]"
                  onError={(e) => {
                    e.target.src = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-[#EFD09E]">
                {employee.full_name}
              </h1>
              <p className="text-[#EFD09E]/70 mt-1">@{employee.username}</p>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#D4AA7D]/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[#D4AA7D]" />
                </div>
                <div>
                  <p className="text-sm text-[#EFD09E]/70 mb-1">Email</p>
                  <p className="font-semibold text-[#EFD09E]">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#D4AA7D]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#D4AA7D]" />
                </div>
                <div>
                  <p className="text-sm text-[#EFD09E]/70 mb-1">Working Hours</p>
                  <p className="font-semibold text-[#EFD09E]">
                    {employee.work_start} - {employee.work_end}
                  </p>
                </div>
              </div>
            </div>

            {/* Working Days Section */}
            <div className="border-t border-[#D4AA7D]/30 pt-8 mb-8">
              <h2 className="text-xl font-bold text-[#EFD09E] mb-4">Working Days</h2>
              <div className="flex flex-wrap gap-3">
                {employee.work_days.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-2 bg-[#D4AA7D] text-[#272727] rounded-full font-medium"
                  >
                    {day}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="border-t border-[#D4AA7D]/30 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#EFD09E]">Skills & Expertise</h2>
              </div>

              {employee.skills && employee.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {employee.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-full"
                    >
                      <span className="text-[#EFD09E] font-medium">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[#EFD09E]/50 text-center py-8">
                  No skills recorded. Click "Add" to add your skills.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BeauticianProfile;