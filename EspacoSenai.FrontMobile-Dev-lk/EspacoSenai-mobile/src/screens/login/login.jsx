import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
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

        const waveHeight = isTinyScreen
            ? Math.min(height * 0.28, 200)
            : isSmallScreen
                ? Math.min(height * 0.32, 240)
                : Math.min(height * 0.35, 280);

        return {
            width,
            height,
            // Tamanhos responsivos do logo - reduzido para telas pequenas
            logoWidth: isTinyScreen
                ? Math.max(width * 0.34, 100)
                : Math.min(Math.max(width * 0.42, 135), 190),
            logoHeight: isTinyScreen
                ? Math.max(width * 0.34, 100) * 0.5625
                : Math.min(Math.max(width * 0.42, 135), 190) * 0.5625,
            logoTop: Platform.OS === "ios"
                ? (isTinyScreen ? Math.max(height * 0.03, 24) : Math.max(height * 0.05, 40))
                : (isTinyScreen ? Math.max(height * 0.025, 20) : Math.max(height * 0.04, 32)),
            waveHeight,
            waveOffset: isTinyScreen
                ? -Math.max(height * 0.05, 24)
                : -Math.max(height * 0.06, 40),
            // Tamanho do card - padding menor em telas pequenas
            cardPadding: isTinyScreen
                ? Math.max(width * 0.045, 15)
                : Math.max(width * 0.06, 18),
            cardMarginTop: Math.max(waveHeight * 0.55, height * 0.18),
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
            buttonHeight: isTinyScreen ? 22 : 38,
            buttonFontSize: isTinyScreen ? 14 : 15,
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
            style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 20,
                    minHeight: dimensions.height,
                }}
                showsVerticalScrollIndicator={false}
                bounces
            >
                <View
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        alignItems: "center",
                        zIndex: 0,
                        overflow: "hidden",
                        height: dimensions.waveHeight,
                        top: dimensions.waveOffset,
                    }}
                >
                    <OndaMobile
                        width={dimensions.width * 1.1}
                        height={dimensions.waveHeight}
                        preserveAspectRatio="xMidYMid slice"
                    />
                </View>

                <View
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        alignItems: "center",
                        zIndex: 10,
                        top: dimensions.logoTop,
                    }}
                >
                    <Logo
                        width={dimensions.logoWidth}
                        height={dimensions.logoHeight}
                        preserveAspectRatio="xMidYMid meet"
                    />
                </View>

                <View
                    style={{
                        width: "90%",
                        maxWidth: 400,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4.65,
                        elevation: 8,
                        padding: dimensions.cardPadding,
                        marginTop: dimensions.cardMarginTop,
                    }}
                >
                    <Text
                        style={{
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#000",
                            fontSize: dimensions.titleSize,
                        }}
                    >
                        Bem-Vindo(a)
                    </Text>

                    <Text
                        style={{
                            fontWeight: "500",
                            textAlign: "center",
                            marginBottom: 24,
                            color: "#000",
                            fontSize: dimensions.subtitleSize,
                        }}
                    >
                        novamente!
                    </Text>

                    {!!erro && (
                        <Text
                            style={{
                                color: "#DC2626",
                                textAlign: "center",
                                fontSize: 14,
                                marginBottom: 12,
                            }}
                        >
                            {erro}
                        </Text>
                    )}

                    <TextInput
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderColor: "#D1D5DB",
                            borderWidth: 1,
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            marginBottom: 16,
                            color: "#000",
                            fontSize: dimensions.inputFontSize,
                        }}
                        placeholder="Email"
                        placeholderTextColor="#6B7280"
                        value={identificador}
                        onChangeText={setIdentificador}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#FFFFFF",
                            borderColor: "#D1D5DB",
                            borderWidth: 1,
                            borderRadius: 6,
                            marginBottom: 16,
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                color: "#000",
                                fontSize: dimensions.inputFontSize,
                            }}
                            placeholder="Senha"
                            placeholderTextColor="#6B7280"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                        />

                        <TouchableOpacity
                            onPress={() => setShowSenha(!showSenha)}
                            style={{ padding: 10 }}
                        >
                            {showSenha ? (
                                <OlhoAberto
                                    width={dimensions.iconSize}
                                    height={dimensions.iconSize}
                                />
                            ) : (
                                <OlhoFechado
                                    width={dimensions.iconSize}
                                    height={dimensions.iconSize}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={{
                            alignItems: "flex-end",
                            marginBottom: 16,
                        }}
                        onPress={() => navigation.navigate("EsqueciSenha")}
                    >
                        <Text
                            style={{
                                color: "#DC2626",
                                fontSize: 12,
                                textDecorationLine: "underline",
                            }}
                        >
                            Esqueceu a Senha?
                        </Text>
                    </TouchableOpacity>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: "#D1D5DB",
                            }}
                        />
                        <Text
                            style={{
                                marginHorizontal: 8,
                                color: "#6B7280",
                                fontSize: 14,
                            }}
                        >
                            ou
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: "#D1D5DB",
                            }}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: "#AE0000",
                            height: dimensions.buttonHeight,
                            width: "75%",
                            alignSelf: "center",
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#AE0000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 6,
                            elevation: 4,
                            opacity: loading ? 0.7 : 1,
                        }}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    fontSize: dimensions.buttonFontSize,
                                }}
                            >
                                Entrar
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            marginTop: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                color: "#000",
                            }}
                        >
                            Não tem uma conta? 
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Cadastro")}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: "#2563EB",
                                    textDecorationLine: "underline",
                                }}
                            >
                                Cadastre-se
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
