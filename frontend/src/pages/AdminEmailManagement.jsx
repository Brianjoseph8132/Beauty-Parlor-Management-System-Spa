import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { Mail, Send, Users, User,CheckCircle,XCircle,Clock,Search,Loader,Bold,Italic,List,AlertCircle} from "lucide-react";
import { DashboardContext } from "../context/DashboardContext";

const AdminEmailManagement = () => {
  const {sendEmailToClient,sendEmailToAllClients,deleteUser, clients} = useContext(DashboardContext);
  const [activeTab, setActiveTab] = useState("all"); 
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  // Form states for "Send to All"
  const [allClientsForm, setAllClientsForm] = useState({
    subject: "",
    message: "",
  });

  // Form states for "Send to Specific"
  const [specificClientForm, setSpecificClientForm] = useState({
    clientUsername: "",
    subject: "",
    message: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

 
  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for client list
  const totalPages = Math.ceil(clients.length / logsPerPage);
  const indexOfLastClient = currentPage * logsPerPage;
  const indexOfFirstClient = indexOfLastClient - logsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteClient = async (clientId) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) return;

    await deleteUser(clientId);
  };


  const handleToggleStatus = (clientId) => {
    // Handle toggle status logic
    console.log("Toggle status for client:", clientId);
    // In production, make API call to update client status
  };

  const handleSendToAll = async () => {
    if (!allClientsForm.subject || !allClientsForm.message) {
      setAlert({ type: "error", message: "Please fill in all fields" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setIsLoading(true);

    const result = await sendEmailToAllClients(
      allClientsForm.subject,
      allClientsForm.message,
      allClientsForm.subject // using subject as title
    );

    setIsLoading(false);

    if (result?.success) {
      setAlert({
        type: "success",
        message: result.success,
      });

      setAllClientsForm({ subject: "", message: "" });
    } else {
      setAlert({
        type: "error",
        message: "Failed to send email",
      });
    }

    setTimeout(() => setAlert(null), 5000);
  };


  const handleSendToSpecific = async () => {
    if (
      !specificClientForm.clientUsername ||
      !specificClientForm.subject ||
      !specificClientForm.message
    ) {
      setAlert({ type: "error", message: "Please fill in all fields" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setIsLoading(true);

    const result = await sendEmailToClient(
      specificClientForm.clientUsername,
      specificClientForm.subject,
      specificClientForm.message,
      specificClientForm.subject // using subject as title
    );

    setIsLoading(false);

    if (result?.success) {
      setAlert({
        type: "success",
        message: result.success,
      });

      setSpecificClientForm({
        clientUsername: "",
        subject: "",
        message: "",
      });

      setSearchTerm("");
    } else {
      setAlert({
        type: "error",
        message: "Failed to send email",
      });
    }

    setTimeout(() => setAlert(null), 5000);
  };

  const selectClient = (client) => {
    setSpecificClientForm({ ...specificClientForm, clientUsername: client.username });
    setSearchTerm(client.username);
    setShowDropdown(false);
  };

  const applyFormatting = (command, formField) => {
    // Simple text formatting helpers (would integrate with a proper rich text editor in production)
    const textarea = document.getElementById(formField);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = selectedText;
    
    if (command === "bold") {
      formattedText = `**${selectedText}**`;
    } else if (command === "italic") {
      formattedText = `*${selectedText}*`;
    } else if (command === "bullet") {
      formattedText = `• ${selectedText}`;
    }

    const newValue = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);

    if (activeTab === "all") {
      setAllClientsForm({ ...allClientsForm, message: newValue });
    } else {
      setSpecificClientForm({ ...specificClientForm, message: newValue });
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#D4AA7D]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#272727]">
              Email <span className="text-[#D4AA7D]">Clients</span>
            </h1>
          </div>
          <p className="text-lg text-[#272727]/70">
            Send announcements, promotions, or personalized messages to your clients
          </p>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                alert.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-700"
                  : "bg-red-500/10 border-red-500/30 text-red-700"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-medium">{alert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-2 shadow-lg mb-8"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition ${
                activeTab === "all"
                  ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                  : "text-[#272727]/60 hover:bg-[#EFD09E]/30"
              }`}
            >
              <Users className="w-5 h-5" />
              Send to All Clients
            </button>
            <button
              onClick={() => setActiveTab("specific")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition ${
                activeTab === "specific"
                  ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                  : "text-[#272727]/60 hover:bg-[#EFD09E]/30"
              }`}
            >
              <User className="w-5 h-5" />
              Send to Specific Client
            </button>
          </div>
        </motion.div>

        {/* Email Forms */}
        <AnimatePresence mode="wait">
          {activeTab === "all" ? (
            <motion.div
              key="all"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-[#D4AA7D]" />
                <h2 className="text-2xl font-bold text-[#272727]">
                  Send to All Clients
                </h2>
              </div>

              {/* Subject Field */}
              <div className="mb-6">
                <label className="block text-[#272727] font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={allClientsForm.subject}
                  onChange={(e) =>
                    setAllClientsForm({ ...allClientsForm, subject: e.target.value })
                  }
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
                />
              </div>

              {/* Message Editor */}
              <div className="mb-6">
                <label className="block text-[#272727] font-semibold mb-2">
                  Message
                </label>
                
                {/* Formatting Toolbar */}
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => applyFormatting("bold", "allClientsMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("italic", "allClientsMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("bullet", "allClientsMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Bullet Point"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  id="allClientsMessage"
                  value={allClientsForm.message}
                  onChange={(e) =>
                    setAllClientsForm({ ...allClientsForm, message: e.target.value })
                  }
                  placeholder="Type your message here..."
                  rows="8"
                  className="w-full px-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                />
              </div>

              {/* Send Button */}
              <motion.button
                onClick={handleSendToAll}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AA7D] text-[#272727] px-6 py-4 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to All Clients ({clients.length})
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="specific"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-[#D4AA7D]" />
                <h2 className="text-2xl font-bold text-[#272727]">
                  Send to Specific Client
                </h2>
              </div>

              {/* Client Selection */}
              <div className="mb-6 relative">
                <label className="block text-[#272727] font-semibold mb-2">
                  Select Client
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search client by username or name..."
                    className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
                  />
                </div>

                {/* Dropdown */}
                {showDropdown && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#D4AA7D]/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="w-full px-4 py-3 text-left hover:bg-[#EFD09E]/30 transition flex items-center gap-3 border-b border-[#D4AA7D]/20 last:border-b-0"
                      >
                        <div className="w-8 h-8 bg-[#D4AA7D] rounded-full flex items-center justify-center text-[#272727] font-semibold text-sm">
                          {client.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#272727]">{client.username}</p>
                          {/* <p className="text-sm text-[#272727]/60">{client.username}</p> */}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Field */}
              <div className="mb-6">
                <label className="block text-[#272727] font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={specificClientForm.subject}
                  onChange={(e) =>
                    setSpecificClientForm({ ...specificClientForm, subject: e.target.value })
                  }
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
                />
              </div>

              {/* Message Editor */}
              <div className="mb-6">
                <label className="block text-[#272727] font-semibold mb-2">
                  Message
                </label>
                
                {/* Formatting Toolbar */}
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => applyFormatting("bold", "specificClientMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("italic", "specificClientMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("bullet", "specificClientMessage")}
                    className="p-2 bg-[#EFD09E]/30 text-[#272727] rounded-lg hover:bg-[#D4AA7D]/30 transition"
                    title="Bullet Point"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  id="specificClientMessage"
                  value={specificClientForm.message}
                  onChange={(e) =>
                    setSpecificClientForm({ ...specificClientForm, message: e.target.value })
                  }
                  placeholder="Type your message here..."
                  rows="8"
                  className="w-full px-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                />
              </div>

              {/* Send Button */}
              <motion.button
                onClick={handleSendToSpecific}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AA7D] text-[#272727] px-6 py-4 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Email
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Client List Table */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-[#D4AA7D]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#D4AA7D]" />
                <h2 className="text-2xl font-bold text-[#272727]">Registered Clients</h2>
              </div>
              <div className="text-sm text-[#272727]/60">
                Total: {clients.length} clients
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#D4AA7D] text-[#272727]">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Client</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-center font-semibold">Total Bookings</th>
                  {/* <th className="px-6 py-4 text-center font-semibold">Status</th> */}
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#D4AA7D]/20 hover:bg-[#EFD09E]/30 transition"
                  >
                    {/* Client Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={client.profile_picture}
                          alt={client.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AA7D]"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48?text=" +
                              (client.username?.charAt(0) || "?");
                          }}
                        />
                        <div>
                          <p className="font-semibold text-[#272727]">{client.username}</p>
                          <p className="text-sm text-[#272727]/60">@{client.username?.toLowerCase().replace(" ", "_")}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <p className="text-[#272727]">{client.email}</p>
                    </td>

                    {/* Total Bookings */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-[#D4AA7D]/20 text-[#272727] rounded-lg font-semibold text-sm">
                          {client.total_bookings}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleStatus(client.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            client.is_active ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              client.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-sm font-medium ${
                          client.is_active ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td> */}

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete Client"
                        >
                          <XCircle className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clients.length > logsPerPage && (
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
          {clients.length > 0 && (
            <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
              Showing {indexOfFirstClient + 1}-{Math.min(indexOfLastClient, clients.length)} of {clients.length} clients
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminEmailManagement;