import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import api from "../api/api";

const STORAGE_KEYS = {
    bearer: "userToken",
    accessToken: "access_token",
    user: "userData",
    roles: "roles",
    profile: "selected_profile"
};

const PROFILE_ALIASES = {
    ALUNO: ["ALUNO", "ALUNOS", "ESTUDANTE", "ESTUDANTES", "STUDENT"],
    PROFESSOR: ["PROFESSOR", "PROFESSORES", "DOCENTE", "TEACHER"],
    COORDENADOR: ["COORDENADOR", "COORDENADORES", "COORD"],
    ADMIN: ["ADMIN", "ADM", "ADMINISTRADOR", "ADMINISTRADORES"]
};

const PROFILE_ROUTES = {
    ALUNO: "HomeAluno",
    PROFESSOR: "HomeProfessor",
    COORDENADOR: "HomeCoordenador",
    ADMIN: "HomeAdmin"
};

function stripBearer(token) {
    return String(token || "").replace(/^Bearer\s+/i, "").trim();
}

function normalizeProfileCode(profile) {
    const value = String(profile || "").trim().toUpperCase();
    if (!value) {
        return null;
    }

    for (const [code, aliases] of Object.entries(PROFILE_ALIASES)) {
        if (aliases.includes(value)) {
            return code;
        }
    }

    return value;
}

function extractRolesFromToken(token) {
    const cleanToken = stripBearer(token);
    if (!cleanToken) {
        return [];
    }

    try {
        const decoded = jwtDecode(cleanToken);
        const raw =
            decoded?.authorities ||
            decoded?.roles ||
            decoded?.scope ||
            decoded?.scp ||
            [];
        const asArray = Array.isArray(raw)
            ? raw
            : String(raw || "")
                  .split(/[ ,]+/)
                  .filter(Boolean);
        return asArray.map((role) => String(role).toUpperCase());
    } catch (error) {
        console.log("[authService] Não foi possível extrair roles do token:", error);
        return [];
    }
}

async function persistSession({ token, user, roles }) {
    const cleanToken = stripBearer(token);
    if (!cleanToken) {
        return;
    }

    const bearerToken = `Bearer ${cleanToken}`;

    await AsyncStorage.setItem(STORAGE_KEYS.bearer, bearerToken);
    await AsyncStorage.setItem(STORAGE_KEYS.accessToken, cleanToken);

    if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }

    if (Array.isArray(roles)) {
        await AsyncStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(roles));
    }
}

function logSignInPayload(payload) {
    try {
        const masked = { ...payload, senha: payload?.senha ? "***" : payload?.senha };
        console.log("[authService] POST /auth/signin payload=", masked);
    } catch {
        // ignore
    }
}

/**
 * Realiza o login do usuário
 * @param {Object} payload  
 * @returns {Promise<Object>}  
 */
export async function signIn(payload) {
    const body = {
        identificador: String(payload?.identificador ?? "").trim(),
        senha: payload?.senha
    };

    if (!body.identificador || !body.senha) {
        throw new Error("Informe o usuário e a senha.");
    }

    logSignInPayload(body);

    try {
        const response = await api.post("/auth/signin", body, { skipAuth: true });
        const data = response?.data ?? response;

        const tokenFromResponse =
            data?.accessToken ||
            data?.token ||
            data?.access_token ||
            data?.jwt ||
            null;

        if (!tokenFromResponse) {
            throw new Error("Token não retornado pelo servidor.");
        }

        const rolesFromToken = extractRolesFromToken(tokenFromResponse);
        const rolesFromPayload = Array.isArray(data?.roles)
            ? data.roles.map((role) => String(role).toUpperCase())
            : [];
        const roles = rolesFromToken.length ? rolesFromToken : rolesFromPayload;

        await persistSession({
            token: tokenFromResponse,
            user: data?.user,
            roles
        });

        return {
            token: stripBearer(tokenFromResponse),
            roles,
            user: data?.user ?? null
        };
    } catch (error) {
        console.error("Erro no signIn: status=", error?.response?.status, "data=", error?.response?.data || error);
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

    const profileCode = normalizeProfileCode(selectedProfile);
    if (!profileCode) {
        return false;
    }

    const normalizedRoles = userRoles.map((role) => String(role || "").toUpperCase());
    const allowedRoles = PROFILE_ALIASES[profileCode] || [profileCode];

    return allowedRoles.some((role) => normalizedRoles.includes(role));
}

/**
 * Retorna a rota correta baseada no perfil selecionado
 * @param {string} profile  
 * @returns {string}  
 */

export function routeForProfile(profile) {
    const profileCode = normalizeProfileCode(profile) || "ALUNO";
    return PROFILE_ROUTES[profileCode] || PROFILE_ROUTES.ALUNO;
}

/**
 * Realiza o logout do usuário
 * @returns {Promise<void>}
 */

export async function signOut() {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.bearer,
            STORAGE_KEYS.accessToken,
            STORAGE_KEYS.user,
            STORAGE_KEYS.roles,
            STORAGE_KEYS.profile
        ]);
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
        // Log detalhado para facilitar diagnóstico (status + corpo retornado)
        console.error("Erro no signUpUsuario: status=", error?.response?.status, "data=", error?.response?.data || error);
        const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Não foi possível realizar o cadastro.";
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
        const endpoint = `/auth/confirmar-conta/${encodeURIComponent(token)}/${encodeURIComponent(codigo)}`;
        const response = await api.get(endpoint);
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
