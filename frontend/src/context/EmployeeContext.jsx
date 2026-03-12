import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../api/Cloudinary"



export const EmployeeContext = createContext();


export const EmployeeProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [allergies, setAllergies] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeAppointments, setEmployeeAppointments] = useState([]);
    const [attendance, setAttendance] = useState([])
    const [todaySummary, setTodaySummary] = useState(null);
    const [scheduledToday, setScheduledToday] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState({});


    const [onChange, setOnChange] = useState(true);




    // =========Allergies========
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/allergies", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => res.json())
        .then((response) => {
            setAllergies(response);
        })
        .catch((error) =>
            console.error("Error fetching allergies:", error)
        );
    }, [authToken, onChange]);



    // ==> Delete Allergy
    const deleteallergy = (allergy_id) => {
        toast.loading("Deleting Allergy...");

        fetch(`https://beauty-parlor-management-system-spa.onrender.com/allergy/${allergy_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.success) {
                    toast.success(response.success);
                    setOnChange(!onChange); 
                } else {
                    toast.error(response.error || "Failed to delete allergy");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error deleting allergy");
                console.error("Delete Allergy Error:", error);
            });
    };


    // ==> Add Allergy
    const addAllergy = async (name) => {
        toast.loading("Adding Allergy...");

        try {
            const resp = await fetch("https://beauty-parlor-management-system-spa.onrender.com/allergy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name }),
            });

            const data = await resp.json();
            toast.dismiss();

            if (!resp.ok) {
            toast.error(data.error || "Failed to add allergy");
            return;
            }

            toast.success(data.success);
            setOnChange((prev) => !prev); // refresh

        } catch (error) {
            toast.dismiss();
            toast.error("Network error");
            console.error("Add Allergy Error:", error);
        }
    };

    // ==> Update Allergy
    const updateAllergy = (name, allergy_id) => {
        toast.loading("Updating Allergy...");

        fetch(`https://beauty-parlor-management-system-spa.onrender.com/allergies/${allergy_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name, allergy_id }), // send new data
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange);
                // Optional: navigate somewhere
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update allergy");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating allergy");
            console.error("Update Allergy Error:", error);
        });
    };


    // =================UpComing Appointments=========
    const fetchUpcomingAppointments = async () => {
        if (!authToken) return;

        const toastId = toast.loading("Fetching upcoming appointments...");

        try {
            const res = await fetch(
                "https://beauty-parlor-management-system-spa.onrender.com/reminders/my-upcoming",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error || "Failed to fetch upcoming appointments"
                );
            }

            setUpcomingAppointments(data.appointments || []);

            toast.update(toastId, {
                render: "Appointments updated",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            setOnChange(!onChange);

        } catch (err) {
            console.error("Reminder fetch error:", err);

            setUpcomingAppointments([]);

            toast.update(toastId, {
                render: err.message || "Something went wrong",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });
        }
    };


    // Auto-fetch on login
    useEffect(() => {
        fetchUpcomingAppointments();
    }, [authToken]);


    // ==============Employee============
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/employees", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => res.json())
        .then((response) => {
            setEmployees(response.employees);
        })
        .catch((error) =>
            console.error("Error fetching Employees:", error)
        );
    }, [authToken, onChange]);



  
    // Get my employee profile (for beauticians)
    const getMyEmployeeProfile = async () => {
        try {
            const res = await fetch("https://beauty-parlor-management-system-spa.onrender.com/employee-profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const response = await res.json();

            if (response.employee) {
                return response.employee;
            } else if (response.error) {
                toast.error(response.error);
                return null;
            }
        } catch (error) {
            toast.error("Error fetching employee profile");
            console.error("Get Employee Profile Error:", error);
            return null;
        }
    };

    // Get employee (get by id)
    const MyEmployeeProfile = async (employee_id) => {
        try {
            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/employee-profile/${employee_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const response = await res.json();

            if (response.employee) {
                return response.employee;
            } else if (response.error) {
                toast.error(response.error);
                return null;
            }
        } catch (error) {
            toast.error("Error fetching employee profile");
            console.error("Get Employee Profile Error:", error);
            return null;
        }
    };



    // Add Employee
    const addEmployee = async (username,full_name,work_start,work_end,imageFile,work_days, skills, other_skills,role) => {
        try {
            toast.loading("Adding Employee...")

            let imageUrl = null

            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile)
                imageUrl = upload.secure_url
            }

            const res = await fetch("https://beauty-parlor-management-system-spa.onrender.com/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    username,
                    full_name,
                    work_start,
                    work_end,
                    work_days,
                    skills,
                    other_skills,
                    profile_picture: imageUrl,
                    role
                    
                }),
            })

            const response = await res.json()
            toast.dismiss()

            if (response.success) {
                toast.success(response.success)
                setOnChange(!onChange)
            } else {
                toast.error(response.error || "Failed to add employee")
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Error adding employee")
            console.error(error)
        }
    };




    // Update Employee
    const updateEmployee = async (full_name,work_start,work_end,imageFile,work_days, skills, other_skills,employee_id,is_active) => {
            try {
                toast.loading("Updating Employee...")
    
                let imageUrl = null
                if (imageFile) {
                    const upload = await uploadToCloudinary(imageFile)
                    imageUrl = upload.secure_url
                }
    
                const payload = {
                    full_name,
                    work_start,
                    work_end,
                    work_days,
                    skills,
                    other_skills,
                    is_active,
                    ...(imageUrl && { employee_profile_picture: imageUrl })
                }
    
                const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/employees/${employee_id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(payload),
                })
    
                const response = await res.json()
                toast.dismiss()
    
                if (response.success) {
                    toast.success(response.success)
                    setOnChange(!onChange)
                } else {
                    toast.error(response.error || "Update failed")
                }
            } catch (err) {
                toast.dismiss()
                toast.error("Error updating employee")
            }
    };
    
   
    // Delete
    const deleteEmployee = (employee_id) => {
        const toastId = toast.loading("Deleting employee...");
        
        fetch(`https://beauty-parlor-management-system-spa.onrender.com/employees/${employee_id}`, {
            method: "DELETE",
            headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${authToken}`,
            },
        })
            .then((resp) => resp.json())
            .then((response) => {
            if (response.success) {
                toast.dismiss(toastId);
                toast.success(response.success); 
                setOnChange(!onChange);
                
                
            } else if (response.error) {
                toast.dismiss(toastId);
                toast.error(response.error); 
            } else {
                toast.dismiss(toastId);
                toast.error("Failed to delete Employee");
            }
            })
            .catch((err) => {
                toast.dismiss(toastId);
                toast.error("Error deleting employee"); 
                console.error("Error deleting employee:", err);
            });
    };

    // =========Appointments============
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/beautician/bookings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch bookings");
                }

                return data;
            })
            .then((data) => {
                // data is an ARRAY
                setEmployeeAppointments(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Error fetching appointments:", error);
               
            });
    }, [authToken, onChange]);


    // Start Appointment
    const startService = async (bookingId) => {
        const toastId = toast.loading("Starting service...");

        try {
            const res = await fetch(
            `https://beauty-parlor-management-system-spa.onrender.com/bookings/start/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();


            if (!res.ok) {
            throw new Error(data.error || "Failed to start service");
            }

            // Update booking status locally
            setEmployeeAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.booking.id === bookingId
                    ? {
                        ...appointment,
                        booking: {
                            ...appointment.booking,
                            status: "in_progress",
                            started_at: data.started_at,
                        },
                        }
                    : appointment
                )
            );


            toast.update(toastId, {
                render: "Service started successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            return data;
        }  catch (err) {
            console.error("Start service error:", err);

            toast.update(toastId, {
                render: err.message || "Failed to start service",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });

            throw err;
        }
    };


    // Complete
    const completeService = async (bookingId) => {
        const toastId = toast.loading("Completing service...");

        try {
            const res = await fetch(
            `https://beauty-parlor-management-system-spa.onrender.com/bookings/complete/${bookingId}`,
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();

            if (!res.ok) {
            throw new Error(data.error || "Failed to complete service");
            }

            setEmployeeAppointments((prev) =>
            prev.map((appointment) =>
                appointment.booking.id === bookingId
                ? {
                    ...appointment,
                    booking: {
                        ...appointment.booking,
                        status: "completed",
                        completed_at: data.completed_at,
                        receipt_sent: data.receipt_sent, 
                    },
                    }
                : appointment
            )
            );

            toast.update(toastId, {
                render: data.receipt_sent
                    ? "Service completed & receipt sent"
                    : "Service completed (receipt not sent)",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });


            return data;
        } catch (err) {
            console.error("Complete service error:", err);

            toast.update(toastId, {
                render: err.message || "Failed to complete service",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });

            throw err;
        }
    };


     //  =============Attendance===============
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/attendance", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => res.json())
        .then((response) => {
            setAttendance(response.attendance || []);
        })
        .catch((error) =>
            console.error("Error fetching Attendance:", error)
        );
    }, [authToken, onChange]);


    // Check-in
    const checkInEmployee = async (employeeId) => {
        const toastId = toast.loading("Checking in...");

        try {
            const res = await fetch(
            `https://beauty-parlor-management-system-spa.onrender.com/attendance/check-in/${employeeId}`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();

            if (!res.ok) {
            toast.dismiss(toastId); 
            throw new Error(data.error || "Check-in failed");
            }

            toast.dismiss(toastId); 
            toast.success(data.message || "Check-in successful");
            setOnChange(!onChange); 

            return data;
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err.message || "Something went wrong");
            throw err;
        }
    };


    // Check-out
    const checkOutEmployee = async (employeeId) => {
        const toastId = toast.loading("Checking out...");

        try {
            const res = await fetch(
            `https://beauty-parlor-management-system-spa.onrender.com/attendance/check-out/${employeeId}`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();

            if (!res.ok) {
            toast.dismiss(toastId); 
            throw new Error(data.error || "Check-out failed");
            }

            toast.dismiss(toastId); 
            toast.success(data.message || "Check-out successful");

            setOnChange(!onChange); 

            return data;
        } catch (err) {
            toast.dismiss(toastId); 
            toast.error(err.message || "Something went wrong");
            throw err;
        }
    };



    // Absent 
    const absentEmployee = async (employeeId) => {
        const toastId = toast.loading("Marking employee absent...");

        try {
            const res = await fetch(
            `https://beauty-parlor-management-system-spa.onrender.com/attendance/absent/${employeeId}`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();

            if (!res.ok) {
            toast.dismiss(toastId);
            throw new Error(data.error || "Failed to mark absent");
            }

            toast.dismiss(toastId);
            toast.success(data.message || "Employee marked absent");

            setOnChange(!onChange);

            return data;
        } catch (err) {
            toast.dismiss(toastId);
            toast.error(err.message || "Something went wrong");
            throw err;
        }
    };


    // Attendance summary
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/attendance/today-summary", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        })
        .then((res) => res.json())
        .then((data) => {
            setTodaySummary(data);
        })
        .catch((error) =>
            console.error("Error fetching attendance summary:", error)
        );
    }, [authToken,onChange]);


    // Employees scheduled today
    useEffect(() => {
        if (!authToken) return;

        fetch("https://beauty-parlor-management-system-spa.onrender.com/attendance/scheduled-today", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch scheduled employees");
                }
                return res.json();
            })
            .then((data) => {
                setScheduledToday(data.employees || []);
            })
            .catch((error) => {
                console.error("Error fetching scheduled employees today:", error);
                setScheduledToday([]);
            })
    }, [authToken, onChange]);

    // todays record
    const fetchTodayAttendance = async () => {
        if (!authToken) {
            toast.error("You are not authenticated");
            return;
        }

        try {
            const res = await fetch(
            "https://beauty-parlor-management-system-spa.onrender.com/attendance/today-records",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
            );

            const data = await res.json();

            if (!res.ok) {
            throw new Error(data.error || "Failed to fetch attendance");
            }

            setAttendanceRecords(data);

        } catch (err) {
            toast.error(err.message || "Attendance fetch failed");
        }
    };







    const data = {
        allergies,
        deleteallergy,
        addAllergy,
        updateAllergy,
        setAllergies,
        upcomingAppointments,
        employees,
        deleteEmployee,
        addEmployee,
        updateEmployee,
        getMyEmployeeProfile,
        MyEmployeeProfile,
        employeeAppointments,
        startService,
        completeService,
        attendance,
        checkInEmployee,
        checkOutEmployee,
        todaySummary,
        scheduledToday,
        absentEmployee,
        fetchTodayAttendance,
        attendanceRecords,
        setAttendanceRecords
        // fetchTodayAttendance
       
    }

    return (
        <EmployeeContext.Provider value={data}>
            {children}
        </EmployeeContext.Provider>
    )

}