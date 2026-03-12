import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../api/Cloudinary"



export const ProductContext = createContext();


export const ProductProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [inventory, setInventory] = useState({
        products: [],
        total_products: 0,
        total_inventory_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
    });

    const navigate = useNavigate()

    const [refreshTrigger, setRefreshTrigger] = useState(0)



    //===========Products=========
    useEffect(() => {
        fetch("https://beauty-parlor-management-system-spa.onrender.com/products/inventory", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => res.json())
        .then((response) => {
            setInventory(response); 
        })
        .catch((err) => {
            console.error("Error fetching inventory:", err);   
        })
            
    }, [authToken, refreshTrigger]); 


    
    // Add Products
    const createProduct = async (product_name,price_per_each,supplier_name,description,min_stock_level,imageFile) => {
        try {
            toast.loading("Adding Service...")

            let imageUrl = null

            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile)
                imageUrl = upload.secure_url
            }

            const res = await fetch("https://beauty-parlor-management-system-spa.onrender.com/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    product_name,
                    price_per_each,
                    supplier_name,
                    description,
                    min_stock_level,
                    product_image: imageUrl,
                }),
            })

            const response = await res.json()
            toast.dismiss()

            if (response.success) {
                toast.success(response.success);
                setRefreshTrigger(prev => prev + 1)
            } else {
                toast.error(response.error || "Failed to create product")
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Error create Product")
            console.error(error)
        }
    }



    // Delete
    const deleteProduct = async (productId) => {
        try {
            toast.loading("Deleting Product...");
            
            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/products/delete/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            
            const response = await res.json();
            toast.dismiss();
            
            if (response.success) {
                toast.success(response.success);
                setRefreshTrigger(prev => prev + 1)
            } else {
                toast.error(response.error || "Failed to delete product");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error deleting product");
            console.error(error);
        }
    };


    // Update Product
    const updateProduct = async (product_name,price_per_each,supplier_name,description,min_stock_level,imageFile,product_id) => {
        try {
            toast.loading("Updating product...")

            let imageUrl = null
            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile)
                imageUrl = upload.secure_url
            }

            const payload = {
                product_name,
                price_per_each,
                supplier_name,
                description,
                min_stock_level,
                ...(imageUrl && { product_image: imageUrl })
            }

            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/products/${product_id}`, {
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
                toast.success(response.success);
                setRefreshTrigger(prev => prev + 1)
            } else {
                toast.error(response.error || "Update failed")
            }
        } catch (err) {
            toast.dismiss()
            toast.error("Error updating product")
        }
    }



    // Restock
    const restockProduct = async (productId, quantity) => {
        try {
            toast.loading("Restocking product...");

            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/products/restock/${productId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    quantity: parseInt(quantity),
                }),
            });

            const response = await res.json();
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setRefreshTrigger(prev => prev + 1)
            } else {
                toast.error(response.error || "Failed to restock product");
                return null;
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error restocking product");
            console.error(error);
            return null;
        }
    };

    // Stock-out product - reduces quantity from existing stock
    const stockOutProduct = async (productId, quantity) => {
        try {
            toast.loading("Processing stock-out...");

            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/products/stock-out/${productId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    quantity: parseInt(quantity),
                }),
            });

            const response = await res.json();
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setRefreshTrigger(prev => prev + 1)
            } else {
                // Handle specific error for insufficient stock
                if (response.available !== undefined) {
                    toast.error(`${response.error}. Available stock: ${response.available}`);
                } else {
                    toast.error(response.error || "Failed to process stock-out");
                }
                return null;
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error processing stock-out");
            console.error(error);
            return null;
        }
    };



    const fetchProductById = async (id) => {
        try {
            const res = await fetch(`https://beauty-parlor-management-system-spa.onrender.com/products/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!res.ok) {
                throw new Error("Product not found");
            }

            const data = await res.json();
            setRefreshTrigger(prev => prev + 1);
            return data; 
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    };








    const data = {
        inventory,
        createProduct,
        deleteProduct,
        updateProduct,
        restockProduct,    
        stockOutProduct,
        fetchProductById

    }

    return (
        <ProductContext.Provider value={data}>
            {children}
        </ProductContext.Provider>
    )
}