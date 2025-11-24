import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUserRole = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRole = async () => {
            const storedRole = await AsyncStorage.getItem("userRole");
            setRole(storedRole);
            setLoading(false);
        };

        loadRole();
    }, []);

    if (loading) {
        return { role: null, loading };
    }

    return { role, loading };
};

export default useUserRole;

export const getUserRole = async () => {
    const role = await AsyncStorage.getItem("userRole");
    return role;
};
export const setUserRole = async (role) => {
    await AsyncStorage.setItem("userRole", role);
};