import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
    const { authToken } = useContext(UserContext);
    const [period, setPeriod] = useState("month"); // matches frontend default "Month"
    const [summary, setSummary] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false); // FIX: was missing
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Attendance Data
    const fetchAttendance = async (selectedPeriod = period) => { // FIX: was comma instead of semicolon
        setLoading(true);
        try {
            const response = await fetch(
                `http://127.0.0.1:5000/admin/employee-attendance?period=${selectedPeriod.toLowerCase()}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch attendance");
            }

            setSummary(data.summary);
            setAttendanceData(data.employees);
        } catch (error) {
            console.error("Attendance fetch error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when period changes or refresh triggered
    useEffect(() => {
        if (authToken) {
            fetchAttendance(period);
        }
    }, [period, authToken, refreshTrigger]);

    const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

    const data = {
        period,
        setPeriod,
        summary,
        attendanceData,
        loading,
        triggerRefresh,
    };

    return (
        <AttendanceContext.Provider value={data}>
            {children}
        </AttendanceContext.Provider>
    );
};