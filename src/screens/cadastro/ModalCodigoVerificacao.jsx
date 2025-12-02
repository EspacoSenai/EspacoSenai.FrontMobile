import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";

// função de serviço para confirmar a conta
import { confirmarConta } from "../../service/authService";
import SetaLeft from "../../../assets/setaleft.svg";

const COR_PRINCIPAL = "#AE0000";

export default function ModalCodigoVerificacao({
  isOpen,
  onClose,
  token,
  length = 6,
  onSuccess,
}) {
  const [values, setValues] = useState(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  // Estado para controlar qual input está focado para mudar a cor da borda
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setValues(Array(length).fill(""));
      setErro("");
      setLoading(false);
      // Pequeno delay para garantir que o modal montou antes de focar
      setTimeout(() => inputsRef.current?.[0]?.focus(), 100);
    }
  }, [isOpen, length]);

  const handleChangeText = (text, i) => {
    // Normaliza para maiúsculo e alfanumérico
    const val = text.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Lógica de "Colar" (Paste): Se o texto for maior que 1 caractere
    if (val.length > 1) {
      const chars = val.slice(0, length).split("");
      const next = Array(length).fill("");
      for (let k = 0; k < chars.length; k++) {
        next[k] = chars[k];
      }
      setValues(next);
      setErro("");
      
      const last = Math.min(chars.length, length) - 1;
      inputsRef.current[last >= 0 ? last : 0]?.focus();
      return;
    }

    // Lógica normal de digitação (1 caractere)
    const next = [...values];
    next[i] = val;
    setValues(next);
    setErro("");

    if (val && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = (e, i) => {
    if (e.nativeEvent.key === "Backspace") {
      // Se o campo atual está vazio e não é o primeiro, volta o foco
      if (!values[i] && i > 0) {
        inputsRef.current[i - 1]?.focus();
        const next = [...values];
        next[i - 1] = "";  
        setValues(next);
      } else {
        // Apenas limpa o atual
        const next = [...values];
        next[i] = "";
        setValues(next);
      }
    }
  };

  const code = values.join("");

  const handleSubmit = async () => {
    if (code.length !== length) {
      setErro(`Digite os ${length} caracteres.`);
      return;
    }
    if (!token) {
      setErro("Token de cadastro não encontrado.");
      return;
    }

    setLoading(true);
    setErro("");
    Keyboard.dismiss(); // Fecha o teclado

    try {
      await confirmarConta(token, code);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErro(err?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose} // Para botão voltar físico do Android
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          {/* O TouchableWithoutFeedback interno serve para evitar que o clique no card feche o modal */}
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardContainer}
            >
              <View style={styles.container}>
                {/* Botão Voltar */}
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <SetaLeft width={24} height={24} fill="#000" />
                </TouchableOpacity>

                <Text style={styles.title}>Verificação</Text>
                
                <Text style={styles.description}>
                  Digite o código de acesso enviado ao seu e-mail.{"\n"}
                  Ele é temporário e garante sua segurança.
                </Text>

                {!!erro && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{erro}</Text>
                  </View>
                )}

                <View style={styles.inputsContainer}>
                  <View style={styles.inputRow}>
                    {[0, 1, 2].map((i) => (
                      <TextInput
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        value={values[i]}
                        onChangeText={(text) => handleChangeText(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        maxLength={length}
                        keyboardType="default"
                        autoCapitalize="characters"
                        style={[
                          styles.input,
                          focusedIndex === i ? styles.inputFocused : null,
                        ]}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(-1)}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                  <View style={styles.inputRow}>
                    {[3, 4, 5].map((i) => (
                      <TextInput
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        value={values[i]}
                        onChangeText={(text) => handleChangeText(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        maxLength={length}
                        keyboardType="default"
                        autoCapitalize="characters"
                        style={[
                          styles.input,
                          focusedIndex === i ? styles.inputFocused : null,
                        ]}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(-1)}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Entrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // bg-black/40
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-6
    width: "90%",
    maxWidth: 400,
    // Sombra equivalente a shadow-[0_20px_60px_rgba(0,0,0,.18)]
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10, // Sombra para Android
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "800", // font-extrabold
    color: "#171717", // text-neutral-900
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14, // text-sm
    color: "#525252", // text-neutral-600
    textAlign: "center",
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 16,
    backgroundColor: "#FEF2F2", // bg-red-50
    borderColor: "#FECACA", // border-red-200
    borderWidth: 1,
    borderRadius: 12, // rounded-xl
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#DC2626", // text-red-600
    fontSize: 14,
    textAlign: "center",
  },
  inputsContainer: {
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  input: {
    width: 48, // w-12
    height: 48, // h-12
    textAlign: "center",
    fontSize: 20, // text-xl
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
    color: "#171717",
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    borderColor: "#E5E7EB", // border-neutral-200
    // Sombra suave no input
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFocused: {
    borderColor: COR_PRINCIPAL,
    borderWidth: 2,
  },
  submitButton: {
    backgroundColor: COR_PRINCIPAL,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12, // rounded-xl
    alignItems: "center",
    justifyContent: "center",
    // Sombra do botão
    shadowColor: COR_PRINCIPAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});