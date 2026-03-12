import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("token"));
    const [current_user, setCurrentUser] = useState(null);




    console.log("Current user:", current_user);

    // LOGIN
    const login = (email, password, rememberMe) => 
        {
            toast.loading("Logging you in ... ")
            fetch("https://beauty-parlor-management-system-spa.onrender.com/login",{
                method:"POST",
                headers: {
                    'Content-type': 'application/json',
                  },
                credentials: "include",
                body: JSON.stringify({
                    email, password, rememberMe
                })
            })
            .then((resp)=>resp.json())
            .then((response)=>{
                if(response.access_token){
                    toast.dismiss()
    
                    sessionStorage.setItem("token", response.access_token);
    
                    setAuthToken(response.access_token)
    
                    fetch('https://beauty-parlor-management-system-spa.onrender.com/current_user',{
                        method:"GET",
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${response.access_token}`
                        }
                    })
                    .then((response) => response.json())
                    .then((response) => {
                      if(response.email){
                              setCurrentUser(response)
                            }
                    });
    
                    toast.success("Successfully Logged in")
                    navigate("/")
                }
                else if(response.error){
                    toast.dismiss()
                    toast.error(response.error)
    
                }
                else{
                    toast.dismiss()
                    toast.error("Failed to login")
    
                }
              
                
            })
        };


  // LOGIN WITH GOOGLE
    const login_with_google = (googleToken) => {
        toast.loading("Logging you in ... ");

        fetch("https://beauty-parlor-management-system-spa.onrender.com/login_with_google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: googleToken, // SEND TOKEN
            }),
            credentials: "include"
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.access_token) {
                sessionStorage.setItem("token", response.access_token);
                setAuthToken(response.access_token);

                fetch("https://beauty-parlor-management-system-spa.onrender.com/current_user", {
                    headers: {
                        "Authorization": `Bearer ${response.access_token}`,
                    },
                })
                .then((res) => res.json())
                .then((user) => {
                    if (user.email) {
                        setCurrentUser(user);
                    }
                });

                toast.success("Successfully logged in");
                navigate("/");
            } else {
                toast.error(response.error || "Google login failed");
            }
        })
        .catch(() => {
            toast.dismiss();
            toast.error("Server error");
        });
    };





    // LOGOUT
    const logout = () => 
    {
        toast.loading("Logging out ... ")
        fetch("https://beauty-parlor-management-system-spa.onrender.com/logout",{
            method:"DELETE",
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${authToken}`
              },
            credentials: "include"
       
        })
        .then((resp)=>resp.json())
        .then((response)=>{
           console.log(response);
           
            if(response.success)
            {
                sessionStorage.removeItem("token");

                setAuthToken(null)
                setCurrentUser(null)

                toast.dismiss()
                toast.success("Successfully Logged out")

                navigate("/login")

            }
        })

    };


    // // Fetch current user
    // useEffect(()=>{
    //     fetchCurrentUser()
    // }, [])
    // const fetchCurrentUser = () => 
    // {
    //     console.log("Current user fcn ",authToken);
        
    //     fetch('https://beauty-parlor-management-system-spa.onrender.com/current_user',{
    //         method:"GET",
    //         headers: {
    //             'Content-type': 'application/json',
    //             Authorization: `Bearer ${authToken}`
    //         }
    //     })
    //     .then((response) => response.json())
    //     .then((response) => {
    //       if(response.email){
    //        setCurrentUser(response)
    //       }
    //     });
    // };

    const fetchCurrentUser = async (token = null) => {
        let accessToken = token || authToken;

        // If no access token, try refresh
        if (!accessToken) {
            try {
                const refreshRes = await fetch("https://beauty-parlor-management-system-spa.onrender.com/refresh", {
                    method: "POST",
                    credentials: "include"
                });

                // 🔹 Refresh failed → user not logged in
                if (!refreshRes.ok) {
                    return;
                }

                // 🔹 Refresh success
                const data = await refreshRes.json();
                accessToken = data.access_token;
                sessionStorage.setItem("token", accessToken);
                setAuthToken(accessToken);

            } catch (err) {
                console.error("Refresh failed:", err);
                return;
            }
        }

        // Fetch current user with access token
        try {
            const userRes = await fetch("https://beauty-parlor-management-system-spa.onrender.com/current_user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!userRes.ok) return;

            const userData = await userRes.json();
            if (userData?.email) {
                setCurrentUser(userData);
            }
        } catch (err) {
            console.error("Fetch current user failed:", err);
        }
    };

    // =========AUTO LOGIN ON PAGE LOAD ========
    useEffect(() => {
        fetchCurrentUser();
    }, []);



    // Add User
    const addUser = (username, email, password, profile_picture) => {
        toast.loading("Registering ... ");
        fetch("https://beauty-parlor-management-system-spa.onrender.com/user", {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
               username, email, password, profile_picture
            })
        })
        .then((resp) => resp.json())
        .then((response) => {
            console.log(response);
            if (response.success) {
                toast.dismiss();
                toast.success(response.success);
                navigate("/login");
            } else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            } else {
                toast.dismiss();
                toast.error("Failed to Add User");
            }
        });
    };


   // Update User
    const updateUser = (username, email, password, profile_picture) => {
        console.log("Updating user:", { username, email, password, profile_picture });
        toast.loading("Updating user...");
        
        fetch("https://beauty-parlor-management-system-spa.onrender.com/update_profile", {
            method: "PUT", 
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                username: username,
                email: email,
                ...(password && { password: password }),
                profile_picture: profile_picture
            })
        })
        .then((resp) => {
            if (!resp.ok) {
                // Get the error message from backend before throwing
                return resp.json().then(errorData => {
                    console.error("Backend error:", errorData);
                    throw new Error(errorData.error || `HTTP error! status: ${resp.status}`);
                });
            }
            return resp.json();
        })
        .then((response) => {
            toast.dismiss();
            if (response.success && response.updatedUser) {
                setCurrentUser(response.updatedUser);
                toast.success("User updated successfully!");
            } else {
                toast.error(response.error || "Failed to update user.");
            }
        })
        .catch((error) => {
            toast.dismiss();
            console.error("Update user error:", error);
            toast.error("An error occurred: " + error.message);
        });
    };

    
    const data = {
        authToken,
        current_user,
        login,
        login_with_google,
        addUser,
        logout,
        updateUser,
        setCurrentUser
        
    };

    return (
        <UserContext.Provider value={data}>
            {children}
        </UserContext.Provider>
    );
 

};
    