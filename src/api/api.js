import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const DEFAULT_BASE_URL = "https://espacosenai.azurewebsites.net";
const ENV_BASE_URL = DEFAULT_BASE_URL;

const STORAGE_KEYS = ["userToken", "access_token", "userData", "roles"];

const PUBLIC_AUTH_PATHS = [
    "/auth/signup",
    "/auth/signin",
    "/auth/confirmar-codigo",
    "/auth/confirmar-conta",
    "/auth/redefinir-senha"
];

const BASE_URL = sanitizeBaseUrl(ENV_BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

function sanitizeBaseUrl(url) {
    const value = String(url || "").trim();
    if (!value) {
        return DEFAULT_BASE_URL;
    }
    return value.replace(/\/+$/, "");
}

function resolvePath(url) {
    const value = String(url || "").trim();
    if (!value) return "/";
    try {
        const parsed = new URL(value, BASE_URL);
        return parsed.pathname || "/";
    } catch {
        return value.startsWith("/") ? value : `/${value}`;
    }
}

function shouldSkipAuth(config = {}) {
    if (config.skipAuth) {
        return true;
    }
    const path = resolvePath(config.url);
    return PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p));
}

async function attachAuthorization(config) {
    // Se já tem Authorization no header, mantém (para tokens específicos de cadastro/redefinição)
    if (config.headers?.Authorization) {
        return config;
    }

    if (shouldSkipAuth(config)) {
        return config;
    }

    try {
        const storedBearer = await AsyncStorage.getItem("userToken");
        const storedPlain = await AsyncStorage.getItem("access_token");
        const token = storedBearer || (storedPlain ? `Bearer ${storedPlain}` : null);

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = token;
        }
    } catch (error) {
        console.log("[api] erro ao recuperar token: ", error);
    }

    return config;
}

async function clearSession() {
    try {
        await AsyncStorage.multiRemove([...STORAGE_KEYS, "selected_profile"]);
    } catch (error) {
        console.log("[api] erro ao limpar sessão: ", error);
    }
}

api.interceptors.request.use(
    async (config) => {
        const nextConfig = await attachAuthorization({ ...config });

        try {
            const auth = nextConfig.headers?.Authorization;
            const method = (nextConfig.method || "GET").toUpperCase();
            if (auth) {
                const token = auth.replace(/^Bearer\s+/i, "");
                const masked = token.length > 8 ? `${token.slice(0, 4)}...${token.slice(-4)}` : token;
                console.log(`[api] ${method} ${nextConfig.url} -> Authorization present (token=${masked})`);
            } else {
                console.log(`[api] ${method} ${nextConfig.url} -> No Authorization header`);
            }
        } catch (err) {
            console.log("[api] erro ao logar Authorization: ", err);
        }

        return nextConfig;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        if ((status === 401 || status === 403) && !shouldSkipAuth(error?.config)) {
            await clearSession();
        }
        return Promise.reject(error);
    }
);

export function getApiBaseUrl() {
    return BASE_URL;
}

export default api;