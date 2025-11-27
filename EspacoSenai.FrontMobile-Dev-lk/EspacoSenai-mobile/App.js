import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importação das telas
import SelecaoPerfil from './src/screens/selecaoperfil/selecaoperfil';
import Login from './src/screens/login/login';
import Cadastro from './src/screens/cadastro/cadastro';
import ModalCodigoVerificacaoScreen from './src/screens/cadastro/ModalCodigoVerificacaoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="SelecionarPerfil"
                screenOptions={{
                    headerShown: false,  
                    animation: 'slide_from_right', 
                }}
            >
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
                    name="Cadastro"
                    component={Cadastro}
                />

                <Stack.Screen
                    name="ModalCodigoVerificacao"
                    component={ModalCodigoVerificacaoScreen}
                    options={{ presentation: 'transparentModal' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
