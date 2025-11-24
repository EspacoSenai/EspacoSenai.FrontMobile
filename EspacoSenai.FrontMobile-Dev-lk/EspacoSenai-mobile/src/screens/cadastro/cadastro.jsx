import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Imports de Assets (Use PNGs se não tiver o transformer de SVG configurado)
import logo from "../../assets/EspacoSenai.png"; 
import onda from "../../assets/ondaCadastro.png"; 
import olhoAberto from "../../assets/olhoAberto.png"; 
import olhoFechado from "../../assets/olhoFechado.png";

// Import do Service e Modal
import { signUpUsuario } from "../../service/authService";
import ModalCodigoVerificacao from "./ModalCodigoVerificacao";

const { width, height } = Dimensions.get("window");

// === Utilitário de Força da Senha ===
const getForcaSenha = (senha) => {
  if (!senha) return "";
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^a-zA-Z0-9]/.test(senha);
  if (senha.length < 6) return "fraca";
  if (senha.length >= 6 && temLetra && temNumero && !temEspecial) return "media";
  if (senha.length >= 8 && temLetra && temNumero && temEspecial) return "forte";
  return "fraca";
};

export default function Cadastro() {
  const navigation = useNavigation();

  // Refs para controle de foco 
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const telRef = useRef(null);
  const senhaRef = useRef(null);
  const confRef = useRef(null);

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [forcaSenha, setForcaSenha] = useState("");

  const [loading, setLoading] = useState(false);

  // Fluxo de confirmação (OTP)
  const [tokenCadastro, setTokenCadastro] = useState("");
  const [openOtp, setOpenOtp] = useState(false);

  const handleSubmit = async () => {
    setErro(false);
    setMensagemErro("");
    setMensagemSucesso("");

    // Validação Básica
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro(true);
      setMensagemErro("Preencha todos os campos obrigatórios.");
      if (!nome) nomeRef.current?.focus();
      else if (!email) emailRef.current?.focus();
      else if (!senha) senhaRef.current?.focus();
      else confRef.current?.focus();
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(true);
      setMensagemErro("As senhas não coincidem.");
      confRef.current?.focus();
      return;
    }

    if (senha.length < 8 || senha.length > 15) {
      setErro(true);
      setMensagemErro("A senha deve ter entre 8 e 15 caracteres.");
      senhaRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const resp = await signUpUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tag: telefone.trim() || null,
      });

      const token = resp?.token ?? null;
      const msg = resp?.message || "Código enviado para seu e-mail.";

      if (token) {
        setTokenCadastro(token);
        setMensagemSucesso(msg);
        setOpenOtp(true);
      } else {
        setErro(true);
        setMensagemErro("Erro ao receber token de verificação. Tente novamente.");
      }
    } catch (error) {
      setErro(true);
      setMensagemErro(error?.message || "Não foi possível realizar o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  // Limpar erro ao corrigir senhas
  useEffect(() => {
    if (senha === confirmarSenha && erro && !mensagemErro) setErro(false);
  }, [senha, confirmarSenha, erro, mensagemErro]);

  // Formatação simples de telefone ao digitar
  const handleTelefoneChange = (text) => {
    const numbersOnly = text.replace(/\D/g, "");
    setTelefone(numbersOnly);
  };

  // Cores dinâmicas para a barra de força
  const getStrengthColor = () => {
    if (forcaSenha === "fraca") return "#EF4444";  
    if (forcaSenha === "media") return "#FBBF24";  
    return "#22C55E"; 
  };

  const getStrengthWidth = () => {
    if (forcaSenha === "fraca") return "33%";
    if (forcaSenha === "media") return "66%";
    return "100%";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Onda de fundo */}
        <View style={styles.waveContainer}>
          <Image source={onda} style={styles.waveImage} resizeMode="cover" />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Card Branco */}
        <View style={styles.card}>
          <Text style={styles.title}>
            Bem-Vindo(a) ao{"\n"}
            <Text style={styles.titleHighlight}>EspaçoSenai!</Text>
          </Text>

          {/* Mensagens de Feedback */}
          {!!mensagemErro && <Text style={styles.errorText}>{mensagemErro}</Text>}
          {!!mensagemSucesso && <Text style={styles.successText}>{mensagemSucesso}</Text>}

          {/* === Formulário === */}
          
          {/* Nome */}
          <TextInput
            ref={nomeRef}
            placeholder="Nome"
            placeholderTextColor="#666"
            style={[styles.input, erro && !nome && styles.inputError]}
            value={nome}
            onChangeText={setNome}
            editable={!tokenCadastro}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Email */}
          <TextInput
            ref={emailRef}
            placeholder="Email"
            placeholderTextColor="#666"
            style={[styles.input, erro && !email && styles.inputError]}
            value={email}
            onChangeText={(t) => setEmail(t.trim())} 
            editable={!tokenCadastro}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => telRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Telefone */}
          <TextInput
            ref={telRef}
            placeholder="Telefone (DDD + Núm)"
            placeholderTextColor="#666"
            style={[styles.input, erro && !telefone && styles.inputError]}
            value={telefone}
            onChangeText={handleTelefoneChange}
            editable={!tokenCadastro}
            keyboardType="numeric"
            maxLength={11}
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Senha */}
          <View style={[styles.passwordContainer, erro && styles.borderError]}>
            <TextInput
              ref={senhaRef}
              placeholder="Senha"
              placeholderTextColor="#666"
              style={styles.inputPassword}
              value={senha}
              onChangeText={(v) => {
                setSenha(v);
                setForcaSenha(getForcaSenha(v));
              }}
              editable={!tokenCadastro}
              secureTextEntry={!showSenha}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeIcon}>
              <Image 
                source={showSenha ? olhoAberto : olhoFechado} 
                style={styles.iconImage} 
              />
            </TouchableOpacity>
          </View>

          {/* Indicador de Força de Senha */}
          {senha.length > 0 && !tokenCadastro && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarBg}>
                <View 
                  style={[
                    styles.strengthBarFill, 
                    { width: getStrengthWidth(), backgroundColor: getStrengthColor() }
                  ]} 
                />
              </View>
              <View style={styles.strengthTextRow}>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                   Força: {forcaSenha.charAt(0).toUpperCase() + forcaSenha.slice(1)}
                </Text>
                {forcaSenha === "fraca" && (
                   <Text style={styles.weakWarning}>Recomendamos senha forte</Text>
                )}
              </View>
            </View>
          )}

          {/* Confirmar Senha */}
          {!tokenCadastro && (
            <View style={[styles.passwordContainer, erro && styles.borderError]}>
              <TextInput
                ref={confRef}
                placeholder="Confirmar senha"
                placeholderTextColor="#666"
                style={styles.inputPassword}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showConfirmar}
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)} style={styles.eyeIcon}>
                <Image 
                  source={showConfirmar ? olhoAberto : olhoFechado} 
                  style={styles.iconImage} 
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Link Já tem conta */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>Entre aqui</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Entrar / Enviar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
             {loading ? (
               <ActivityIndicator color="#FFF" />
             ) : (
               <Text style={styles.buttonText}>{tokenCadastro ? "Verificar" : "Entrar"}</Text>
             )}
          </TouchableOpacity>
        </View>

        {/* Modal de OTP */}
        {openOtp && (
          <ModalCodigoVerificacao
            isOpen={openOtp}
            token={tokenCadastro}
            length={6}
            onClose={() => setOpenOtp(false)}
            onSuccess={() => {
              setOpenOtp(false);
              navigation.navigate("Login");
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  waveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 250, 
    zIndex: -1,
  },
  waveImage: {
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  logo: {
    width: 90,
    height: 45,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 80, // Distância do topo
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
    lineHeight: 28,
  },
  titleHighlight: {
    color: "#000",
    fontWeight: "bold",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    color: "#16A34A",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Altura confortável para o dedo
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  borderError: {
    borderColor: "#DC2626",
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 12,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: "#4B5563",
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: 16,
  },
  strengthBarBg: {
    height: 6,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
  },
  strengthTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  weakWarning: {
    fontSize: 10,
    color: "#DC2626",
    alignSelf: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#000",
  },
  linkText: {
    fontSize: 14,
    color: "#2563EB",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#AE0000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#AE0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});