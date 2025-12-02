import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VLibrasWeb from './src/components/VLibrasWeb';

// Importação das telas
import SelecaoPerfil from './src/screens/selecaoperfil/selecaoperfil';
import Login from './src/screens/login/login';
import Cadastro from './src/screens/cadastro/cadastro';
import EsqueciSenha from './src/screens/senhas/esquecisenha';
import CodigoRecuperacao from './src/screens/senhas/códigorecuperacao';
import NovaSenha from './src/screens/senhas/novasenha';
import TelaCarregamento from './src/screens/autenticação/telacarregamento';
import Notificacoes from './src/screens/notificações/notificacoes';
import SemNotificacao from './src/screens/notificações/semnotificacao';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            {/* Injeta VLibras apenas no web */}
            {/* <VLibrasWeb /> */}
            <Stack.Navigator
                initialRouteName="TelaCarregamento"
                screenOptions={{
                    headerShown: false,  
                    animation: 'slide_from_right', 
                }}
            >
                <Stack.Screen
                    name="TelaCarregamento"
                    component={TelaCarregamento}
                    options={{ animation: 'fade' }}
                />

                {/* Tela de Seleção de Perfil */}
                <Stack.Screen
                    name="SelecionarPerfil"
                    component={SelecaoPerfil}
                />

                {/* Tela de Login */}
                <Stack.Screen
                    name="Login"
                    component={Login}
                />

                <Stack.Screen
                    name="EsqueciSenha"
                    component={EsqueciSenha}
                />

                <Stack.Screen
                    name="CodigoRedefinirSenha"
                    component={CodigoRecuperacao}
                />

                <Stack.Screen
                    name="NovaSenha"
                    component={NovaSenha}
                />

                <Stack.Screen
                    name="Cadastro"
                    component={Cadastro}
                />

                {/* Rota de Notificações */}
                <Stack.Screen
                    name="Notificacoes"
                    component={Notificacoes}
                />
                {/* SemNotificacao */}
                <Stack.Screen
                    name="SemNotificacao"
                    component={SemNotificacao}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
