/* eslint-disable react-hooks/exhaustive-deps */
import { createContext } from "react"
import { useState } from "react"

import { useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { io } from "socket.io-client"

const getBackendUrl = () => {
    if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        return window.location.origin;
    }
    return "http://localhost:4000";
};

const backendUrl = getBackendUrl();
axios.defaults.baseURL = backendUrl;


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check-auth")

            if (data.success) {
                const userData = data.user;
                if (userData) {
                    userData.fullName = userData.fullName || userData.fullname || "";
                    userData.profilePic = userData.profilePic || userData.profilepic || "";
                }
                setAuthUser(userData);
                connectSocket(userData)
            }
        }
        catch (err) {
            console.log("Check auth error:", err.message);
        }
    }

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)

            if (data.success) {
                const userData = data.user || data.userData || data.newUser;
                if (userData) {
                    userData.fullName = userData.fullName || userData.fullname || "";
                    userData.profilePic = userData.profilePic || userData.profilepic || "";
                }
                setAuthUser(userData);
                connectSocket(userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message || "Success!");
            }
            else {
                toast.error(data.message || "Failed");
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        delete axios.defaults.headers.common["token"];
        toast.success('logged out successfully')
        if (socket) socket.disconnect()
    }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                const userData = data.user || data.updatedUser;
                if (userData) {
                    userData.fullName = userData.fullName || userData.fullname || "";
                    userData.profilePic = userData.profilePic || userData.profilepic || "";
                }
                setAuthUser(userData);
                toast.success("Profile updated successfully");
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    }


    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        })

        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token])


    const value = {
        axios,
        authUser,
        socket,
        onlineUsers,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}