import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import api from "./api"; // 👉 ajusta o caminho conforme sua pasta

// Teste com o Back-end

export default function TestarConexao() {
    const [mensagem, setMensagem] = useState("Aguardando teste...");

    async function testar() {
        try {
            setMensagem("⏳ Testando conexão...");
            const response = await api.get("/api/ping"); // 👈 Chama o endpoint
            setMensagem(`✅ Conectado: ${response.data}`);
        } catch (error) {
            console.log("Erro de conexão:", error);
            setMensagem(`❌ Erro: ${error.message}`);
        }
    }

    return (
        <View style={styles.container}>
            {/* <Text style={styles.titulo}>Teste de Conexão com o Backend</Text> */}
            <Button title="Testar Conexão" onPress={testar} />
            <Text style={styles.resultado}>{mensagem}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    resultado: { marginTop: 20, fontSize: 16, textAlign: "center" },
});
