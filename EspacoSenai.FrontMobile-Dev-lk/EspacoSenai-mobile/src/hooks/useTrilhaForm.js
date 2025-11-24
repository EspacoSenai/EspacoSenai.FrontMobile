import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useTrilhaForm = () => {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [vagas, setVagas] = useState('');
    const [descricao, setDescricao] = useState('');
    const [image, setImage] = useState(null);
    const [activities, setActivities] = useState([]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar imagens.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        if (!nome || !vagas || !descricao) {
            Alert.alert('Atenção', 'Por favor, preencha nome, vagas e descrição.');
            return false;
        }
        return true;
    };

    const resetForm = () => {
        setNome('');
        setSenha('');
        setVagas('');
        setDescricao('');
        setImage(null);
        setActivities([]);
    };

    const loadFormData = (trail) => {
        setNome(trail.trailName || '');
        setDescricao(trail.trailDescription || '');
        setVagas(trail.trailVacancy ? trail.trailVacancy.toString() : '');
        setSenha(trail.trailPassword || '');
        setImage(trail.trailImage || null);
        setActivities(trail.activities || []);
    };

    return {
        nome, setNome,
        senha, setSenha,
        vagas, setVagas,
        descricao, setDescricao,
        image, setImage,
        activities, setActivities,
        pickImage,
        validateForm,
        resetForm,
        loadFormData,
    };
};