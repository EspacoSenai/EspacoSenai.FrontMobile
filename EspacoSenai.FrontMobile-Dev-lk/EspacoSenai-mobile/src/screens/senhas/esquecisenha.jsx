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

import OndaMobile from '../../../assets/ondamobilesenha.svg';
import SetaWhiteLeft from '../../../assets/setawhiteleft.svg';
import { solicitarCodigoRedefinicao } from '../../service/authService';

const CODIGO_ROUTE = 'CodigoRedefinirSenha';

const EsqueciSenha = () => {
	const navigation = useNavigation();

	const [email, setEmail] = useState('');
	const [carregando, setCarregando] = useState(false);
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState('');

	const dimensions = useMemo(() => {
		const { width, height } = Dimensions.get('window');
		const isSmallScreen = width < 360;
		const isTinyScreen = width < 340;

		const waveHeight = isTinyScreen
			? Math.min(height * 0.18, 140)
			: isSmallScreen
				? Math.min(height * 0.22, 180)
				: Math.min(height * 0.26, 210);

		return {
			width,
			height,
			waveHeight,
			waveOffset: isTinyScreen
				? -Math.max(height * 0.035, 18)
				: -Math.max(height * 0.045, 26),
			logoWidth: isTinyScreen
				? Math.max(width * 0.34, 100)
				: Math.min(Math.max(width * 0.42, 135), 190),
			logoHeight: isTinyScreen
				? Math.max(width * 0.34, 100) * 0.5
				: Math.min(Math.max(width * 0.42, 135), 190) * 0.5,
			logoTop: Platform.OS === 'ios'
				? (isTinyScreen ? Math.max(height * 0.04, 24) : Math.max(height * 0.065, 42))
				: (isTinyScreen ? Math.max(height * 0.035, 20) : Math.max(height * 0.055, 34)),
			backButtonTop: Platform.OS === 'ios'
				? (isTinyScreen ? Math.max(height * 0.02, 14) : Math.max(height * 0.035, 20))
				: (isTinyScreen ? Math.max(height * 0.015, 12) : Math.max(height * 0.03, 16)),
			cardPadding: isTinyScreen ? Math.max(width * 0.045, 16) : Math.max(width * 0.06, 20),
			cardMarginTop: Math.max(waveHeight * 1|.0, height * 0.26),
			titleSize: isTinyScreen ? Math.max(width * 0.06, 20) : Math.min(width * 0.07, 30),
			descriptionSize: isTinyScreen ? 13 : Math.min(width * 0.045, 15),
			inputFontSize: isTinyScreen ? 14 : Math.min(width * 0.042, 16),
			buttonHeight: isTinyScreen ? 38 : 40,
			buttonFontSize: isTinyScreen ? 14 : 15,
		};
	}, []);

	const handleSubmit = async () => {
		setErro('');
		setSucesso('');

		const emailTrim = email.trim();
		if (!emailTrim) {
			setErro('Informe o email para enviar o código.');
			return;
		}

		setCarregando(true);

		try {
			const data = await solicitarCodigoRedefinicao(emailTrim);

			setSucesso(
				data?.message || 'Código para redefinição enviado para seu email.'
			);

			setTimeout(() => {
				if (CODIGO_ROUTE) {
					navigation.navigate(CODIGO_ROUTE, { email: emailTrim });
				}
			}, 1200);
		} catch (error) {
			setErro(
				error?.message ||
					'Não foi possível enviar o código. Verifique o email e tente novamente.'
			);
		} finally {
			setCarregando(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1, backgroundColor: '#FFF' }}
		>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					alignItems: 'center',
					paddingTop: Math.max(dimensions.waveHeight * 0.05, 10),
					paddingBottom: 32,
					minHeight: dimensions.height,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
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
							marginBottom: 12,
						}}
					>
						Esqueceu a senha?
					</Text>

					<Text
						style={{
							textAlign: 'center',
							color: '#000',
							fontSize: dimensions.descriptionSize,
							lineHeight: 20,
							marginBottom: 28,
						}}
					>
						Vamos enviar um código de verificação por email para você criar uma nova senha.
					</Text>

					<View style={{ marginBottom: 18 }}>
						<Text
							style={{
								fontWeight: '500',
								color: '#111',
								fontSize: 16,
								marginBottom: 6,
							}}
						>
							Email
						</Text>
						<TextInput
							placeholder="Digite seu email"
							placeholderTextColor="#6B7280"
							keyboardType="email-address"
							autoCapitalize="none"
							value={email}
							onChangeText={setEmail}
							style={{
								backgroundColor: '#F3F4F6',
								borderRadius: 8,
								borderWidth: 1,
								borderColor: '#E5E7EB',
								paddingHorizontal: 14,
								paddingVertical: 12,
								fontSize: dimensions.inputFontSize,
								color: '#111',
							}}
						/>
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
						disabled={carregando || !email.trim()}
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
							opacity: carregando || !email.trim() ? 0.7 : 1,
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
								Enviar código
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

export default EsqueciSenha;
