import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { Camera, Edit2, X, Plus, Trash2 } from "lucide-react";
import { EmployeeContext } from "../context/EmployeeContext";
import { UserContext } from "../context/UserContext";
import { uploadToCloudinary } from "../api/Cloudinary";

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isEditingAllergy, setIsEditingAllergy] = useState(false);
  const [editingAllergyId, setEditingAllergyId] = useState(null);
  const [newAllergy, setNewAllergy] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { allergies, deleteallergy, addAllergy, updateAllergy } = useContext(EmployeeContext);
  const { current_user, updateUser,setCurrentUser } = useContext(UserContext);

  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    password: "",
    profile_picture: "",
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Initialize form data when current_user changes
  useEffect(() => {
    if (current_user) {
      setEditFormData({
        username: current_user.username || "",
        email: current_user.email || "",
        password: "",
        profile_picture: current_user.profile_picture || "",
      });
    }
  }, [current_user]);

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    console.log("MUST", file)
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      console.log("RUTO", result)

      setProfilePicturePreview(result.secure_url);
      setEditFormData({
        ...editFormData,
        profile_picture: result.secure_url,
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editFormData.username.trim()) {
      alert("Username is required");
      return;
    }

    if (!editFormData.email.trim()) {
      alert("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Debug: Log what we're sending
    console.log("Data being sent:", {
      username: editFormData.username,
      email: editFormData.email,
      password: editFormData.password || "",
      profile_picture: editFormData.profile_picture
    });

    await updateUser(
      editFormData.username,
      editFormData.email,
      editFormData.password || "",
      editFormData.profile_picture
    );

    setIsEditModalOpen(false);
    setProfilePicturePreview(null);
    setEditFormData(prev => ({ ...prev, password: "" }));
  };
  const handleAddOrUpdateAllergy = async () => {
    if (newAllergy.trim()) {
      if (isEditingAllergy && editingAllergyId) {
        await updateAllergy(newAllergy.trim(), editingAllergyId);
      } else {
        await addAllergy(newAllergy.trim());
      }
      
      setNewAllergy("");
      setIsAllergyModalOpen(false);
      setIsEditingAllergy(false);
      setEditingAllergyId(null);
    }
  };

  const handleEditAllergy = (allergy) => {
    setNewAllergy(allergy.name);
    setIsEditingAllergy(true);
    setEditingAllergyId(allergy.id);
    setIsAllergyModalOpen(true);
  };

  const handleDeleteAllergy = (allergyId) => {
    if (window.confirm("Are you sure you want to delete this allergy?")) {
      deleteallergy(allergyId);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

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
            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              <motion.button
                onClick={() => setIsEditModalOpen(true)}
                className="p-3 rounded-full bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Edit profile"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AA7D] to-[#EFD09E] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={current_user?.profile_picture || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover relative z-10 border-4 border-[#D4AA7D]"
                  onError={(e) => {
                    e.target.src = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-[#EFD09E]">
                {current_user?.username || "Guest User"}
              </h1>
              <p className="text-[#EFD09E]/70 mt-1">{current_user?.email || "No email provided"}</p>
            </div>

            {/* Allergies Section */}
            <div className="border-t border-[#D4AA7D]/30 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#EFD09E]">Allergies</h2>
                <motion.button
                  onClick={() => {
                    setIsAllergyModalOpen(true);
                    setIsEditingAllergy(false);
                    setEditingAllergyId(null);
                    setNewAllergy("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AA7D] text-[#272727] rounded-lg font-semibold hover:bg-[#EFD09E] transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </motion.button>
              </div>

              {allergies && allergies.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {allergies.map((allergy) => (
                    <motion.div
                      key={allergy.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-full"
                    >
                      <span className="text-[#EFD09E] font-medium">{allergy.name}</span>
                      <button
                        onClick={() => handleEditAllergy(allergy)}
                        className="p-1 hover:bg-[#D4AA7D]/20 rounded-full transition"
                      >
                        <Edit2 className="w-3 h-3 text-[#D4AA7D]" />
                      </button>
                      <button
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="p-1 hover:bg-red-500/20 rounded-full transition"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[#EFD09E]/50 text-center py-8">
                  No allergies recorded.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#EFD09E]">Edit Profile</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditFormData({
                      username: current_user?.username || "",
                      email: current_user?.email || "",
                      password: "",
                      profile_picture: current_user?.profile_picture || "",
                    });
                    setProfilePicturePreview(null);
                  }}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <img
                      src={profilePicturePreview || editFormData.profile_picture || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="}
                      alt="Profile Preview"
                      className="w-full h-full rounded-full object-cover border-4 border-[#D4AA7D]"
                      onError={(e) => {
                        e.target.src = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                      }}
                    />
                    <label
                      htmlFor="profilePicture"
                      className={`absolute bottom-0 right-0 p-2 bg-[#D4AA7D] rounded-full cursor-pointer hover:bg-[#EFD09E] transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-[#272727] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-[#272727]" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                  <p className="text-sm text-[#EFD09E]/70">
                    {isUploading ? "Uploading..." : "Click camera to change photo"}
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isUploading ? 1 : 1.02 }}
                    whileTap={{ scale: isUploading ? 1 : 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditFormData({
                        username: current_user?.username || "",
                        email: current_user?.email || "",
                        password: "",
                        profile_picture: current_user?.profile_picture || "",
                      });
                      setProfilePicturePreview(null);
                    }}
                    className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Allergy Modal */}
      <AnimatePresence>
        {isAllergyModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#EFD09E]">
                  {isEditingAllergy ? "Edit Allergy" : "Add Allergy"}
                </h2>
                <button
                  onClick={() => {
                    setIsAllergyModalOpen(false);
                    setNewAllergy("");
                    setIsEditingAllergy(false);
                    setEditingAllergyId(null);
                  }}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Allergy Name
                  </label>
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="e.g., Latex, Fragrance, Parabens"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddOrUpdateAllergy();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={handleAddOrUpdateAllergy}
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isEditingAllergy ? "Update" : "Add"}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsAllergyModalOpen(false);
                      setNewAllergy("");
                      setIsEditingAllergy(false);
                      setEditingAllergyId(null);
                    }}
                    className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

