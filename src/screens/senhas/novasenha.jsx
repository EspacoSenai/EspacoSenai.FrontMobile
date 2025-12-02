import React, { useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OndaMobile from '../../../assets/ondasenhamobilee.svg';
import SetaWhiteLeft from '../../../assets/setawhiteleft.svg';
import OlhoAberto from '../../../assets/olhoAberto.svg';
import OlhoFechado from '../../../assets/olhoFechado.svg';
import { redefinirNovaSenha } from '../../service/authService';

const RETURN_ROUTE = 'Login';

const NovaSenha = () => {
	const navigation = useNavigation();

	const [novaSenha, setNovaSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
	const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
	const [carregando, setCarregando] = useState(false);
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState('');

	const dimensions = useMemo(() => {
		const { width, height } = Dimensions.get('window');
		const isSmallScreen = width < 360;
		const isTinyScreen = width < 340;

		const waveHeight = isTinyScreen
			? Math.min(height * 0.15, 130)
			: isSmallScreen
				? Math.min(height * 0.19, 170)
				: Math.min(height * 0.24, 200);

		return {
			width,
			height,
			waveHeight,
			waveOffset: isTinyScreen
				? -Math.max(height * 0.035, 18)
				: -Math.max(height * 0.045, 26),
			backButtonTop: Platform.OS === 'ios'
				? (isTinyScreen ? Math.max(height * 0.02, 14) : Math.max(height * 0.035, 20))
				: (isTinyScreen ? Math.max(height * 0.015, 12) : Math.max(height * 0.03, 16)),
			cardPadding: isTinyScreen ? Math.max(width * 0.045, 16) : Math.max(width * 0.06, 20),
			// Empurra o card visualmente mais para baixo e mantém posição estável
			cardMarginTop: Math.max(waveHeight * 1.0, height * 0.30),
			titleSize: isTinyScreen ? Math.max(width * 0.055, 18) : Math.min(width * 0.065, 26),
			descriptionSize: isTinyScreen ? 13 : Math.min(width * 0.045, 15),
			inputFontSize: isTinyScreen ? 14 : Math.min(width * 0.042, 16),
			buttonHeight: isTinyScreen ? 38 : 40,
			buttonFontSize: isTinyScreen ? 14 : 15,
			labelFontSize: isTinyScreen ? 15 : 16,
			iconSize: isTinyScreen ? 18 : Math.min(width * 0.055, 22),
		};
	}, []);

	const validarCampos = () => {
		setErro('');
		setSucesso('');

		const senha = novaSenha.trim();
		const confirmar = confirmarSenha.trim();

		if (!senha || !confirmar) {
			setErro('Preencha a nova senha e a confirmação.');
			return false;
		}

		if (senha.length < 6) {
			setErro('A nova senha deve ter pelo menos 6 caracteres.');
			return false;
		}

		if (senha !== confirmar) {
			setErro('As senhas digitadas não conferem.');
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		if (!validarCampos()) {
			return;
		}

		setCarregando(true);

		try {
			const token = await AsyncStorage.getItem('tokenRedefinirSenha');
			
			if (!token) {
				setErro('Sessão expirada. Solicite um novo código de verificação.');
				setTimeout(() => {
					navigation.navigate('EsqueciSenha');
				}, 2000);
				return;
			}

			const data = await redefinirNovaSenha(token, novaSenha.trim());
			setSucesso(data?.message || 'Senha redefinida com sucesso!');
			setNovaSenha('');
			setConfirmarSenha('');
			setTimeout(() => {
				if (RETURN_ROUTE) {
					navigation.reset({
						index: 0,
						routes: [{ name: RETURN_ROUTE }],
					});
				}
			}, 1000);
		} catch (error) {
			const mensagem = error?.message || 'Não foi possível redefinir a senha.';
			setErro(mensagem);
		} finally {
			setCarregando(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={{ flex: 1, backgroundColor: '#FFF' }}
		>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					alignItems: 'center',
					paddingTop: Math.max(dimensions.waveHeight * 0.02, 6),
					paddingBottom: 32,
					minHeight: dimensions.height,
				}}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View
					style={{
						position: 'absolute',
						top: dimensions.waveOffset,
						left: 0,
						right: 0,
						alignItems: 'center',
						zIndex: 0,
						overflow: 'hidden',
						width: '100%',
						height: dimensions.waveHeight,
					}}
				>
					<OndaMobile
						width={dimensions.width * 1.05}
						height={dimensions.waveHeight}
						preserveAspectRatio="xMidYMid slice"
					/>
				</View>

				<TouchableOpacity
					style={{
						position: 'absolute',
						left: 24,
						top: dimensions.backButtonTop,
						zIndex: 20,
						padding: 6,
					}}
					onPress={() => navigation.goBack()}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<SetaWhiteLeft width={28} height={28} />
				</TouchableOpacity>

				<View
					style={{
						width: '90%',
						maxWidth: 420,
						backgroundColor: 'rgba(255,255,255,0.95)',
						borderRadius: 12,
						padding: dimensions.cardPadding,
						marginTop: dimensions.cardMarginTop,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 6 },
						shadowOpacity: 0.12,
						shadowRadius: 10,
						elevation: 8,
					}}
				>
					<Text
						style={{
							textAlign: 'center',
							fontWeight: '600',
							fontSize: dimensions.titleSize,
							color: '#111',
							marginBottom: 8,
						}}
					>
						Crie uma nova senha
					</Text>

					<Text
						style={{
							textAlign: 'center',
							color: '#000',
							fontSize: dimensions.descriptionSize,
							lineHeight: 20,
							marginBottom: 24,
						}}
					>
						Escolha uma senha forte para concluir a redefinição do seu acesso.
					</Text>

					<View style={{ marginBottom: 18 }}>
						<Text
							style={{
								fontWeight: '500',
								color: '#111',
								fontSize: dimensions.labelFontSize,
								marginBottom: 6,
							}}
						>
							Nova senha
						</Text>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 8,
								borderWidth: 1,
								borderColor: '#E5E7EB',
								backgroundColor: '#F3F4F6',
								paddingHorizontal: 12,
							}}
						>
							<TextInput
								placeholder="Digite a nova senha"
								placeholderTextColor="#6B7280"
								secureTextEntry={!mostrarNovaSenha}
								value={novaSenha}
								onChangeText={setNovaSenha}
								style={{
									flex: 1,
									paddingVertical: 12,
									fontSize: dimensions.inputFontSize,
									color: '#111',
								}}
							/>
							<TouchableOpacity
								onPress={() => setMostrarNovaSenha((prev) => !prev)}
								style={{ padding: 8 }}
							>
								{mostrarNovaSenha ? (
									<OlhoAberto width={dimensions.iconSize} height={dimensions.iconSize} />
								) : (
									<OlhoFechado width={dimensions.iconSize} height={dimensions.iconSize} />
								)}
							</TouchableOpacity>
						</View>
					</View>

					<View style={{ marginBottom: 12 }}>
						<Text
							style={{
								fontWeight: '500',
								color: '#111',
								fontSize: dimensions.labelFontSize,
								marginBottom: 6,
							}}
						>
							Confirmar nova senha
						</Text>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 8,
								borderWidth: 1,
								borderColor: '#E5E7EB',
								backgroundColor: '#F3F4F6',
								paddingHorizontal: 12,
							}}
						>
							<TextInput
								placeholder="Confirme a nova senha"
								placeholderTextColor="#6B7280"
								secureTextEntry={!mostrarConfirmarSenha}
								value={confirmarSenha}
								onChangeText={setConfirmarSenha}
								style={{
									flex: 1,
									paddingVertical: 12,
									fontSize: dimensions.inputFontSize,
									color: '#111',
								}}
							/>
							<TouchableOpacity
								onPress={() => setMostrarConfirmarSenha((prev) => !prev)}
								style={{ padding: 8 }}
							>
								{mostrarConfirmarSenha ? (
									<OlhoAberto width={dimensions.iconSize} height={dimensions.iconSize} />
								) : (
									<OlhoFechado width={dimensions.iconSize} height={dimensions.iconSize} />
								)}
							</TouchableOpacity>
						</View>
					</View>

					{!!erro && (
						<Text
							style={{
								color: '#DC2626',
								textAlign: 'center',
								fontSize: 14,
								marginBottom: 12,
							}}
						>
							{erro}
						</Text>
					)}

					{!!sucesso && (
						<Text
							style={{
								color: '#16A34A',
								textAlign: 'center',
								fontSize: 14,
								marginBottom: 12,
							}}
						>
							{sucesso}
						</Text>
					)}

					<TouchableOpacity
						onPress={handleSubmit}
						disabled={carregando}
						style={{
							backgroundColor: '#AE0000',
							height: dimensions.buttonHeight,
							width: '75%',
							alignSelf: 'center',
							borderRadius: 10,
							alignItems: 'center',
							justifyContent: 'center',
							marginTop: 8,
							shadowColor: '#AE0000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.25,
							shadowRadius: 6,
							elevation: 4,
							opacity: carregando ? 0.7 : 1,
						}}
					>
						{carregando ? (
							<ActivityIndicator color="#FFF" />
						) : (
							<Text
								style={{
									color: '#FFF',
									fontSize: dimensions.buttonFontSize,
									fontWeight: '700',
								}}
							>
								Salvar
							</Text>
						)}
					</TouchableOpacity>

					<View
						style={{
							marginTop: 18,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text style={{ color: '#111', fontSize: 14 }}>Voltar ao </Text>
						<TouchableOpacity onPress={() => navigation.navigate('Login')}>
							<Text
								style={{
									color: '#2563EB',
									textDecorationLine: 'underline',
									fontWeight: '600',
									fontSize: 14,
								}}
							>
								Login
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default NovaSenha;
