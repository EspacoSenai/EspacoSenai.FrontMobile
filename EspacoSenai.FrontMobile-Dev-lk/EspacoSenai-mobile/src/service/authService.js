import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

/**
 * Realiza o login do usuário
 * @param {Object} payload  
 * @returns {Promise<Object>}  
 */
export async function signIn(payload) {
    try {
        const response = await api.post("/auth/signin", payload);

        const { token, user } = response.data;

        // Salvar token no AsyncStorage
        if (token) {
            await AsyncStorage.setItem("userToken", token);
        }

        // Salvar dados do usuário
        if (user) {
            await AsyncStorage.setItem("userData", JSON.stringify(user));
        }

        // Retornar roles do usuário
        return {
            roles: user?.roles || [],
            user: user
        };
    } catch (error) {
        console.error("Erro no signIn:", error);
        throw error;
    }
}

/**
 * Verifica se o usuário possui a role selecionada
 * @param {string} selectedProfile  
 * @param {Array} userRoles  
 * @returns {boolean}  
 */
export function userHasRole(selectedProfile, userRoles) {
    if (!userRoles || !Array.isArray(userRoles)) {
        return false;
    }

    // Normalizar para minúsculas para comparação
    const normalizedProfile = selectedProfile.toLowerCase();
    const normalizedRoles = userRoles.map(role => role.toLowerCase());

    return normalizedRoles.includes(normalizedProfile);
}

/**
 * Retorna a rota correta baseada no perfil selecionado
 * @param {string} profile  
 * @returns {string}  
 */
export function routeForProfile(profile) {
    const routes = {
        "aluno": "HomeAluno",
        "professor": "HomeProfessor",
        "admin": "HomeAdmin",
        "responsavel": "HomeResponsavel"
    };

    const normalizedProfile = profile.toLowerCase();
    return routes[normalizedProfile] || "Home";
}

/**
 * Realiza o logout do usuário
 * @returns {Promise<void>}
 */
export async function signOut() {
    try {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userData");
        await AsyncStorage.removeItem("selected_profile");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
}
