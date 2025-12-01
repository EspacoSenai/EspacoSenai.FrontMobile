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
    useWindowDimensions,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Logo from "../../../assets/logodark.svg";
import OndaMobile from "../../../assets/ondamobile.svg";
import OlhoAberto from "../../../assets/olhoAberto.svg";
import OlhoFechado from "../../../assets/olhoFechado.svg";

import { signIn, userHasRole, routeForProfile } from "../../service/authService";

const WAVE_ASPECT_RATIO = 320 / 199;

export default function Login() {
    const [showSenha, setShowSenha] = useState(false);
    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const navigation = useNavigation();

    const { width, height } = useWindowDimensions();

    // Dimensões responsivas
    const dimensions = useMemo(() => {
        let waveHeight = height * 0.35;
        let waveWidth = waveHeight * WAVE_ASPECT_RATIO;

        if (waveWidth < width * 1.1) {
            waveWidth = width * 1.1;
            waveHeight = waveWidth / WAVE_ASPECT_RATIO;
        }

        return {
            width,
            height,
            waveHeight,
            waveWidth,
            waveOffset: -height * 0.08,
            logoWidth: width * 0.42,
            logoHeight: width * 0.42 * 0.5625,
            logoTop: height * 0.05,
            cardPadding: width * 0.06,
            cardMarginTop: height * 0.35,
            titleSize: width * 0.065,
            subtitleSize: width * 0.05,
            inputFontSize: width * 0.04,
            iconSize: width * 0.055,
            buttonHeight: height * 0.07,
            buttonFontSize: width * 0.045,
            smallText: width * 0.032,
            fieldSpacing: height * 0.02,
            inputPaddingVertical: height * 0.015,
            inputPaddingHorizontal: width * 0.035,
        };
    }, [width, height]);

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

        const identificadorTrim = identificador.trim();

        if (!identificadorTrim || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            const selectedProfile = await AsyncStorage.getItem("selected_profile");

            if (!selectedProfile) {
                setErro("Selecione um perfil antes de entrar.");
                navigation.navigate("SelecionarPerfil");
                return;
            }

            const payload = {
                identificador: identificadorTrim,
                senha,
            };

            const { roles } = await signIn(payload);

            if (!userHasRole(selectedProfile, roles)) {
                Alert.alert(
                    "Acesso negado",
                    "Seu usuário não possui permissão para o perfil selecionado."
                );
                return;
            }

            const nextRoute = routeForProfile(selectedProfile);

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: nextRoute }],
                })
            );

        } catch (err) {
            // Em desenvolvimento, mostrar o erro completo para debug (status + corpo).
            let msg;
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
                const resp = err?.response;
                if (resp) {
                    try {
                        msg = `status: ${resp.status}\n${JSON.stringify(resp.data, null, 2)}`;
                    } catch (e) {
                        msg = `status: ${resp.status}\n${String(resp.data)}`;
                    }
                } else {
                    msg = err?.message || String(err);
                }
            } else {
                msg = err?.response?.data?.message || err?.message || "Não foi possível entrar.";
            }

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
                    paddingBottom: height * 0.08,
                    paddingTop: height * 0.12,
                    minHeight: height,
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
                        width={dimensions.waveWidth}
                        height={dimensions.waveHeight}
                        preserveAspectRatio="xMidYMid slice"
                        style={{
                            transform: [
                                { translateX: -(dimensions.waveWidth - dimensions.width) / 2 },
                            ],
                        }}
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
                            marginBottom: dimensions.fieldSpacing / 2,
                        }}
                    >
                        Bem-Vindo(a)
                    </Text>

                    <Text
                        style={{
                            fontWeight: "500",
                            textAlign: "center",
                            marginBottom: dimensions.fieldSpacing,
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
                                fontSize: dimensions.smallText,
                                marginBottom: dimensions.fieldSpacing / 2,
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
                            paddingHorizontal: dimensions.inputPaddingHorizontal,
                            paddingVertical: dimensions.inputPaddingVertical,
                            marginBottom: dimensions.fieldSpacing,
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
                            marginBottom: dimensions.fieldSpacing,
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                paddingHorizontal: dimensions.inputPaddingHorizontal,
                                paddingVertical: dimensions.inputPaddingVertical,
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
                            style={{ padding: dimensions.inputPaddingVertical }}
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
                            marginBottom: dimensions.fieldSpacing,
                        }}
                        onPress={() => navigation.navigate("EsqueciSenha")}
                    >
                        <Text
                            style={{
                                color: "#DC2626",
                                fontSize: dimensions.smallText,
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
                            marginBottom: dimensions.fieldSpacing,
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
                                marginHorizontal: width * 0.02,
                                color: "#6B7280",
                                fontSize: dimensions.smallText,
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
                            marginTop: dimensions.fieldSpacing,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: dimensions.smallText,
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
                                    fontSize: dimensions.smallText,
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
