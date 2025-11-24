import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

export const useTrilhaApi = () => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [createdTrails, setCreatedTrails] = useState([]);

    useEffect(() => {
        const loadUserId = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserId(decoded.userId);
                } catch (error) {
                    console.error('Erro ao decodificar token:', error);
                }
            }
        };
        loadUserId();
    }, []);

    // Função de busca de trilhas criadas pelo professor
    const fetchCreatedTrails = async (uid) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const resp = await api.get('/trail/read/by/teacher', {
                
            });
            console.log('Trilhas criadas (raw):', resp.data);   // DEBUG
            setCreatedTrails(resp.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar suas trilhas criadas.');
            console.warn('Erro ao buscar trilhas do professor:', error);
        }
    };

    // Função De criação de trilha
    const criarTrilha = async (formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            const response = await api.post('/trail/create', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha criada com sucesso!');
            fetchCreatedTrails(userId);
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar a trilha. Tente novamente mais tarde.');
            console.error(error);
        }
    };

    // Função De atualização de trilha
    const updateTrilha = async (trailId, formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            const response = await api.put(`/trail/update/${trailId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha atualizada com sucesso!');
            fetchCreatedTrails(userId);
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a trilha. Tente novamente.');
            console.error(error);
        }
    };

    // Função de deletar uma trilha
    const deleteTrilha = async (trailId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            await api.delete(`/trail/delete/${trailId}`, {
            });
            Alert.alert('Sucesso', 'Trilha deletada com sucesso!');
            fetchCreatedTrails(userId);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar a trilha. Tente novamente.');
            console.error(error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCreatedTrails();
        }
    }, [userId]);

    return {
        userToken,
        userId,
        createdTrails,
        fetchCreatedTrails,
        criarTrilha,
        updateTrilha,
        deleteTrilha,
    };
};