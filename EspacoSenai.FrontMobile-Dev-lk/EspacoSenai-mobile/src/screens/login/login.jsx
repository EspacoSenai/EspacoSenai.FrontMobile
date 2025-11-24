import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Logo from "../../../assets/logodark.svg";
import OndaMobile from "../../../assets/ondamobile.svg";
import OlhoAberto from "../../../assets/olhoAberto.svg";
import OlhoFechado from "../../../assets/olhoFechado.svg";

import { signIn, userHasRole, routeForProfile } from "../../service/authService";

export default function Login() {
    const [showSenha, setShowSenha] = useState(false);
    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const navigation = useNavigation();

    // Dimensões responsivas
    const dimensions = useMemo(() => {
        const { width, height } = Dimensions.get("window");

        // Detectar telas pequenas (< 360px)
        const isSmallScreen = width < 360;
        const isTinyScreen = width < 340;

        return {
            width,
            height,
            // Tamanhos responsivos do logo - reduzido para telas pequenas
            logoWidth: isTinyScreen
                ? Math.max(width * 0.22, 70)
                : Math.min(Math.max(width * 0.25, 80), 120),
            logoHeight: isTinyScreen
                ? Math.max(width * 0.22, 70) * 0.5
                : Math.min(Math.max(width * 0.25, 80), 120) * 0.5,
            waveHeight: isTinyScreen
                ? Math.min(height * 0.28, 200)
                : isSmallScreen
                    ? Math.min(height * 0.32, 240)
                    : Math.min(height * 0.35, 280),
            // Tamanho do card - padding menor em telas pequenas
            cardPadding: isTinyScreen
                ? Math.max(width * 0.045, 15)
                : Math.max(width * 0.06, 18),
            cardMarginTop: isSmallScreen
                ? height * 0.10
                : height * 0.12,
            // Tamanhos de fonte - ajustados para legibilidade
            titleSize: isTinyScreen
                ? Math.max(width * 0.055, 18)
                : Math.min(width * 0.065, 28),
            subtitleSize: isTinyScreen
                ? Math.max(width * 0.048, 16)
                : Math.min(width * 0.055, 22),
            inputFontSize: isTinyScreen
                ? 14
                : Math.min(width * 0.042, 16),
            // Ícones - proporcionais  
            iconSize: isTinyScreen
                ? 18
                : Math.min(width * 0.055, 22),
        };
    }, []);

    // Verificação inicial de Perfil
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const sel = await AsyncStorage.getItem("selected_profile");

                if (!sel) {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "SelecionarPerfil" }],
                        })
                    );
                }
            } catch (error) {
                console.log("Erro ao ler storage", error);
            }
        };
        checkProfile();
    }, [navigation]);

    const handleSubmit = async () => {
        setErro("");

        if (!identificador.trim() || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            const selected = await AsyncStorage.getItem("selected_profile");

            if (!selected) {
                navigation.navigate("SelecionarPerfil");
                return;
            }

            const payload = {
                identificador: identificador.trim(),
                senha: senha,
            };

            console.log("[DEBUG] /auth/signin payload:", payload);

            const { roles } = await signIn(payload);

            if (!userHasRole(selected, roles)) {
                Alert.alert(
                    "Acesso Negado",
                    "Seu usuário não possui permissão para o perfil selecionado."
                );
                return;
            }

            // Navegar para a rota correta baseada no perfil
            const nextRoute = routeForProfile(selected);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: nextRoute }],
                })
            );

        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Não foi possível entrar. Verifique seus dados.";
            setErro(msg);

        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { minHeight: dimensions.height }]}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Imagem de Fundo / Onda */}
                <View style={[styles.waveContainer, { height: dimensions.waveHeight }]}>
                    <OndaMobile width={dimensions.width} height={dimensions.waveHeight} />
                </View>

                {/* Logo */}
                <View style={[styles.logoContainer, { top: dimensions.height * 0.05 }]}>
                    <Logo width={dimensions.logoWidth} height={dimensions.logoHeight} preserveAspectRatio="xMidYMid meet" />
                </View>

                {/* Card de Login */}
                <View style={[styles.card, { padding: dimensions.cardPadding, marginTop: dimensions.cardMarginTop }]}>
                    <Text style={[styles.title, { fontSize: dimensions.titleSize }]}>Bem-Vindo(a)</Text>
                    <Text style={[styles.subtitle, { fontSize: dimensions.subtitleSize }]}>novamente!</Text>

                    {!!erro && <Text style={styles.errorText}>{erro}</Text>}

                    {/* Input Email/Identificador */}
                    <TextInput
                        style={[styles.input, { fontSize: dimensions.inputFontSize }]}
                        placeholder="Email"
                        placeholderTextColor="#6B7280"
                        value={identificador}
                        onChangeText={setIdentificador}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    {/* Input Senha */}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.inputPassword, { fontSize: dimensions.inputFontSize }]}
                            placeholder="Senha"
                            placeholderTextColor="#6B7280"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                        />
                        <TouchableOpacity
                            onPress={() => setShowSenha(!showSenha)}
                            style={styles.eyeIcon}
                        >
                            {showSenha ? (
                                <OlhoAberto width={dimensions.iconSize} height={dimensions.iconSize} />
                            ) : (
                                <OlhoFechado width={dimensions.iconSize} height={dimensions.iconSize} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Link Esqueci Senha */}
                    <TouchableOpacity
                        style={styles.forgotPassContainer}
                        onPress={() => navigation.navigate("EsqueciSenha")}
                    >
                        <Text style={styles.forgotPassText}>Esqueceu a Senha?</Text>
                    </TouchableOpacity>

                    {/* Divisor "ou" */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>ou</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Botão Login */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer Cadastro */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
                            <Text style={styles.linkText}>Cadastre-se</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 20,
    },
    waveContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
    logoContainer: {
        position: "absolute",
        left: 24,
        zIndex: 10,
    },
    card: {
        width: "90%",
        maxWidth: 400,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 8,
    },
    title: {
        fontWeight: "600",
        textAlign: "center",
        color: "#000",
    },
    subtitle: {
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 24,
        color: "#000",
    },
    errorText: {
        color: "#DC2626",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 12,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderColor: "#D1D5DB",
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 16,
        color: "#000",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderColor: "#D1D5DB",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 16,
    },
    inputPassword: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: "#000",
    },
    eyeIcon: {
        padding: 10,
    },
    forgotPassContainer: {
        alignItems: "flex-end",
        marginBottom: 16,
    },
    forgotPassText: {
        color: "#DC2626",
        fontSize: 12,
        textDecorationLine: "underline",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#D1D5DB",
    },
    orText: {
        marginHorizontal: 8,
        color: "#6B7280",
        fontSize: 14,
    },
    button: {
        backgroundColor: "#AE0000",
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: "#000",
    },
    linkText: {
        fontSize: 12,
        color: "#2563EB",
        textDecorationLine: "underline",
    },
});
