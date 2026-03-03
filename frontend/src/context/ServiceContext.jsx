import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../api/Cloudinary"

export const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
    const { authToken } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);

    const [onChange, setOnChange] = useState(true)



//   ===============Categories============
  useEffect(() => {
    fetch("http://127.0.0.1:5000/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })
      .then((res) => res.json())
      .then((response) => {
        setCategories(response);
      })
      .catch((error) =>
        console.error("Error fetching categories:", error)
      );
  }, [authToken, onChange]);



   // ==> Delete Category (by name)
    const deleteCategory = (categoryName) => {
        toast.loading("Deleting Category...");

        fetch(`http://127.0.0.1:5000/categories/name/${encodeURIComponent(categoryName)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.message) {
                    toast.success(response.message);
                    setOnChange(!onChange); 
                } else {
                    toast.error(response.error || "Failed to delete category");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error deleting category");
                console.error("Delete Category Error:", error);
            });
    };


    // ==> Add Category
    const addCategory = (name) => {
        toast.loading("Adding Category...");

        fetch("http://127.0.0.1:5000/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name }),
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.success) {
                    toast.success(response.success);
                    setOnChange(!onChange); // refresh categories
                } else if (response.error) {
                    toast.error(response.error);
                } else {
                    toast.error("Failed to add category");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error adding category");
                console.error("Add Category Error:", error);
            });
    };


    // ==> Update Category by Name
    const updateCategory = (currentName, newName) => {
        toast.loading("Updating Category...");

        fetch(`http://127.0.0.1:5000/category/name/${encodeURIComponent(currentName)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name: newName }), // send new data
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange); // refresh categories
                // Optional: navigate somewhere
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update category");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating category");
            console.error("Update Category Error:", error);
        });
    };


    // ==================Services=====================
    useEffect(() => {
        fetch("http://127.0.0.1:5000/services", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        })
        .then((res) => res.json())
        .then((response) => {
            // console.log("SERVICES:", response)
            setServices(response);
        })
        .catch((error) =>
            console.error("Error fetching services:", error)
        );
    }, [authToken, onChange]);


    // Add Service 
    const addService = async (title,description,duration_minutes,price,imageFile,category_name) => {
        try {
            toast.loading("Adding Service...")

            let imageUrl = null

            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile)
                imageUrl = upload.secure_url
            }

            const res = await fetch("http://127.0.0.1:5000/service", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    duration_minutes,
                    price,
                    image: imageUrl,
                    category_name
                }),
            })

            const response = await res.json()
            toast.dismiss()

            if (response.success) {
                toast.success(response.success)
                setOnChange(!onChange)
            } else {
                toast.error(response.error || "Failed to add service")
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Error adding service")
            console.error(error)
        }
    }


    // Fetch Service by ID
    const getServiceById = (service_id) => {
        return fetch(`http://127.0.0.1:5000/service/${service_id}`, {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then((resp) => resp.json())
            .then((response) => {
                if (response.error) {
                    toast.error(response.error);
                    return null;
                }
                return response;
            })
            .catch((error) => {
                toast.error("Failed to fetch Service.");
                console.error(error);
                return null;
            });
    };

    // Update service
    const updateService = async (title,description,duration_minutes,price,imageFile,category_name,service_id) => {
        try {
            toast.loading("Updating service...")

            let imageUrl = null
            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile)
                imageUrl = upload.secure_url
            }

            const payload = {
                title,
                description,
                duration_minutes,
                price,
                category_name,
                ...(imageUrl && { image: imageUrl })
            }

            const res = await fetch(`http://127.0.0.1:5000/services/${service_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            })

            const response = await res.json()
            toast.dismiss()

            if (response.message) {
                toast.success(response.message)
                setOnChange(!onChange)
            } else {
                toast.error(response.error || "Update failed")
            }
        } catch (err) {
            toast.dismiss()
            toast.error("Error updating service")
        }
    }


    
   // Delete Service
    const deleteService = async (service_id) => {
        try {
            toast.loading("Deleting Service...");
            
            const res = await fetch(`http://127.0.0.1:5000/service-del/${service_id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const response = await res.json();
            toast.dismiss();
            
            if (response.message) {
                toast.success(response.message);
                setOnChange(!onChange);
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to delete service.");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error deleting service.");
            console.error("Delete Service Error:", error);
        }
    };


    // Inside your existing context
    const downloadReceipt = async (bookingId) => {
        const toastId = toast.loading("Downloading receipt...");
        
        try {
            const response = await fetch(
                `http://127.0.0.1:5000/receipts/${bookingId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            // Check if response is OK (status 200-299)
            if (!response.ok) {
                // Try to parse error message from response
                const errorData = await response.json();
                toast.dismiss(toastId);
                toast.error(errorData.message || errorData.error || "Failed to download receipt");
                return { success: false, error: errorData.message };
            }

            // Get the PDF blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-BK${String(bookingId).padStart(6, '0')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(toastId);
            toast.success("Receipt downloaded successfully!");
            return { success: true };
            
        } catch (err) {
            console.error("Error downloading receipt:", err);
            toast.dismiss(toastId);
            toast.error(err.message || "Failed to download receipt");

            return { success: false, error: err.message };
        }
    };


  const data ={
    categories,
    services,
    deleteCategory,
    addCategory,
    updateCategory,
    addService,
    getServiceById,
    updateService,
    deleteService,
    downloadReceipt
  }
  return (
    <ServiceContext.Provider value={data}>
      {children}
    </ServiceContext.Provider>
  );
};
