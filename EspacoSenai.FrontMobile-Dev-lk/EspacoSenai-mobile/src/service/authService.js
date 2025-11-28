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

        // Salvar token 
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

/**
 * Realiza o cadastro de um novo usuário e retorna o token de verificação enviado pelo backend.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function signUpUsuario(payload) {
    try {
        const response = await api.post("/auth/signup", payload);
        return response.data || {};
    } catch (error) {
        console.error("Erro no signUpUsuario:", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.message || "Não foi possível realizar o cadastro.";
        throw new Error(message);
    }
}

/**
 * Confirma a conta do usuário utilizando o token retornado no cadastro e o código digitado.
 * @param {string} token
 * @param {string} codigo
 * @returns {Promise<Object>}
 */
export async function confirmarConta(token, codigo) {
    try {
        const response = await api.post("/auth/confirmar-codigo", { token, codigo });
        return response.data || {};
    } catch (error) {
        console.error("Erro no confirmarConta:", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.message || "Não foi possível confirmar o cadastro.";
        throw new Error(message);
    }
}

/**
 * Solicita o envio do código de redefinição de senha e armazena o token retornado
 * @param {string} identificador
 * @returns {Promise<Object>}
 */
export async function solicitarCodigoRedefinicao(identificador) {
    try {
        const response = await api.post("/auth/redefinir-senha", { identificador });
        const data = response.data || {};

        if (data?.token) {
            await AsyncStorage.setItem("tokenRedefinirSenha", data.token);
        }

        return data;
    } catch (error) {
        console.error("Erro no solicitarCodigoRedefinicao:", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.message || "Não foi possível enviar o código.";
        throw new Error(message);
    }
}

/**
 * Valida o código enviado para redefinição de senha.
 * @param {string} token
 * @param {string} codigo
 * @returns {Promise<Object>}
 */
export async function validarCodigoRedefinicao(token, codigo) {
    try {
        const endpoint = `/auth/redefinir-senha/validar-codigo/${encodeURIComponent(token)}/${encodeURIComponent(codigo)}`;
        const response = await api.get(endpoint);
        return response.data || {};
    } catch (error) {
        console.error("Erro no validarCodigoRedefinicao:", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.message || "Não foi possível validar o código.";
        throw new Error(message);
    }
}

/**
 * Define uma nova senha utilizando o token de redefinição.
 * @param {string} token
 * @param {string} novaSenha
 * @returns {Promise<Object>}
 */
export async function redefinirNovaSenha(token, novaSenha) {
    if (!token) {
        throw new Error("Sessão expirada. Volte para 'Esqueci a senha' e solicite um novo código.");
    }

    try {
        const endpoint = `/auth/redefinir-senha/nova-senha/${encodeURIComponent(token)}`;
        const response = await api.post(endpoint, { novaSenha });

        // token não é mais necessário após sucesso
        await AsyncStorage.removeItem("tokenRedefinirSenha");

        return response.data || {};
    } catch (error) {
        console.error("Erro no redefinirNovaSenha:", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.message || "Não foi possível redefinir a senha.";
        throw new Error(message);
    }
}
