import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
    baseURL: ""
    // baseURL: ''
})

api.interceptors.request.use(
    async(config) => {
        try { // O try Tenta pegar o token
            const token = await AsyncStorage.getItem('userToken') // Procurar no celular se existe um token salvo
            if (token) {
                config.headers.Authorization = `Bearer ${token}`; // Aqui verificar se encontrou o token se encontrou 
                // Cola no cabeçalho do pedido
            }
        } catch (error) { // Se deu ruim na hora de buscar o token Mostre um erro
            console.log('Erro ao recuperar token: ', error)
        }
        return config; // Aqui ele devolve o pedido se existir pra manda pro servidor(Back-end)
    },
    (error) => Promise.reject(error) // Se deu algun erro antes de mandar ele ja rejeita na hora 
)

export default api;