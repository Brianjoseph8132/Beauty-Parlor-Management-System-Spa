import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const DashboardContext = createContext();

export const DashboardProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [period, setPeriod] = useState("today"); // Changed to lowercase to match backend
    const [summary, setSummary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clients, setClients] = useState([])

    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Performance 
    const fetchPerformance = async (selectedPeriod = period) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(
                `http://127.0.0.1:5000/employee-performance?period=${selectedPeriod.toLowerCase()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch performance data");
            }

            const data = await res.json();
            // console.log("DATA",data)

            // Transform backend data to match frontend expectations
            const transformedEmployees = data.employees.map(emp => ({
                id: emp.employee_id,
                name: emp.employee_name,
                avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp.employee_id}`,
                totalAppointments: emp.total_appointments,
                completedAppointments: emp.completed,
                totalRevenue: emp.total_revenue,
                contributionPercent: emp.contribution_percent
            }));
            // console.log("TRANSFORMEDEMPLOYEES", transformedEmployees)

            setSummary(data.summary);
            setEmployees(transformedEmployees);
        } catch (err) {
            console.error("Performance fetch error:", err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto fetch when period changes or authToken is available
    useEffect(() => {
        if (authToken) {
            fetchPerformance(period);
        }
    }, [period, authToken]);




    // =========Clients============
    useEffect(() => {
        if (!authToken) return;

        fetch("http://127.0.0.1:5000/admin/clients", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch clients");
            }
            return res.json();
        })
        .then((response) => {
            setClients(response.clients);
        })
        .catch((error) =>
            console.error("Error fetching clients:", error)
        );

    }, [authToken, refreshTrigger]);


    // Send Email to all Clients
    const sendEmailToAllClients = async (subject, message, title) => {
        const toastId = toast.loading("Sending...");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/send-email/all-clients",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        subject,
                        message,
                        title,
                    }),
                }
            );

            const result = await response.json();

            toast.dismiss(toastId);

            if (!response.ok) {
                toast.error(result.error || "Failed to send email");
                return;
            }

            toast.success(result.success);

            return result;

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Something went wrong");
            console.error("Send email error:", error);
        }
    };




    // Send to client
    const sendEmailToClient = async (username, subject, message, title) => {
        const toastId = toast.loading("Sending...");

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/send-email/client/${encodeURIComponent(username)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        subject,
                        message,
                        title,
                    }),
                }
            );

            const result = await response.json();

            toast.dismiss(toastId);

            if (!response.ok) {
                toast.error(result.error || "Failed to send email");
                return { error: result.error };
            }


            toast.success(result.success);

            return result;

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Something went wrong");
            console.error(error);
        }
    };


    // Delete clients
    const deleteUser = async (userId) => {
        if (!authToken) {
            toast.error("Unauthorized");
            return;
        }

        const toastId = toast.loading("Deleting user...");

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/admin/users/${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const result = await response.json();
            toast.dismiss(toastId);

            if (!response.ok) {
                toast.error(result.error || "Failed to delete user");
                return;
            }

            // Update state immediately (no refetch needed)
            setClients((prevClients) =>
                prevClients.filter((client) => client.id !== userId)
            );

            toast.success(result.success);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Something went wrong");
            console.error(error);
        }
    };





    const data = {
        period,
        employees,
        setPeriod,
        summary,
        loading,
        error,
        refetch: fetchPerformance,
        sendEmailToClient,
        sendEmailToAllClients,
        deleteUser,
        clients
    };

    return (
        <DashboardContext.Provider value={data}>
            {children}
        </DashboardContext.Provider>
    );
};