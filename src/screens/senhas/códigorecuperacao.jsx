import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import OndaMobile from '../../../assets/ondamobilesenha.svg';
import SetaWhiteLeft from '../../../assets/setawhiteleft.svg';
import { solicitarCodigoRedefinicao, validarCodigoRedefinicao } from '../../service/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const LENGTH = 6;
const NEXT_ROUTE = 'NovaSenha';

const CodigoRecuperacao = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const emailParam = route?.params?.email || '';

	const [values, setValues] = useState(Array(LENGTH).fill(''));
	const [sucesso, setSucesso] = useState('');
	const [erro, setErro] = useState('');
	const [validando, setValidando] = useState(false);
	const [reenvioTimer, setReenvioTimer] = useState(59);
	const [reenviando, setReenviando] = useState(false);
	const [reenvioErro, setReenvioErro] = useState('');
	const [reenvioSucesso, setReenvioSucesso] = useState('');
	const [focusedIndex, setFocusedIndex] = useState(-1);

	const inputsRef = useRef([]);

	useEffect(() => {
		setValues(Array(LENGTH).fill(''));
		const timeout = setTimeout(() => inputsRef.current?.[0]?.focus(), 250);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (reenvioTimer <= 0) {
			return undefined;
		}

		const interval = setInterval(() => {
			setReenvioTimer((prev) => {
				if (prev <= 0) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [reenvioTimer]);

	useEffect(() => {
		const filled = values.every((value) => value.length === 1);
		if (filled && !validando) {
			validarCodigo();
		}
	}, [values]);

	const validarCodigo = async () => {
		const codigo = values.join('');
		if (codigo.length !== LENGTH) {
			return;
		}

		setValidando(true);
		setErro('');
		setSucesso('');

		try {
			const token = await AsyncStorage.getItem('tokenRedefinirSenha');
			
			if (!token) {
				setErro('Sessão expirada. Solicite um novo código.');
				setValidando(false);
				return;
			}

			await validarCodigoRedefinicao(token, codigo);
			setSucesso('Código validado com sucesso! Redirecionando...');
			
			setTimeout(() => {
				if (NEXT_ROUTE) {
					navigation.navigate(NEXT_ROUTE);
				}
			}, 600);
		} catch (error) {
			setErro(error?.message || 'Código inválido. Tente novamente.');
			setValues(Array(LENGTH).fill(''));
			setTimeout(() => inputsRef.current?.[0]?.focus(), 100);
		} finally {
			setValidando(false);
		}
	};

	const handleReenviarCodigo = async () => {
		if (reenvioTimer > 0 || reenviando) {
			return;
		}

		if (!emailParam) {
			setReenvioErro('Não foi possível reenviar: email não informado.');
			return;
		}

		setReenvioErro('');
		setReenvioSucesso('');
		setReenviando(true);

		try {
			await solicitarCodigoRedefinicao(emailParam);
			setReenvioSucesso('Enviamos um novo código para o seu email.');
			setValues(Array(LENGTH).fill(''));
			setSucesso('');
			setFocusedIndex(-1);
			setTimeout(() => inputsRef.current?.[0]?.focus(), 200);
			setReenvioTimer(59);
		} catch (error) {
			setReenvioErro(
				error?.message || 'Não conseguimos reenviar agora. Tente novamente em instantes.'
			);
		} finally {
			setReenviando(false);
		}
	};

	const formatTimer = (seconds) => {
		const mins = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const secs = (seconds % 60)
			.toString()
			.padStart(2, '0');
		return `${mins}:${secs}`;
	};

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
				? -Math.max(height * 0.025, 14)
				: -Math.max(height * 0.035, 20),
			backButtonTop: Platform.OS === 'ios'
				? (isTinyScreen ? Math.max(height * 0.02, 14) : Math.max(height * 0.035, 20))
				: (isTinyScreen ? Math.max(height * 0.015, 12) : Math.max(height * 0.03, 16)),
			cardPadding: isTinyScreen ? Math.max(width * 0.045, 16) : Math.max(width * 0.06, 20),
			cardMarginTop: Math.max(waveHeight * 0.95, height * 0.26),
			titleSize: isTinyScreen ? Math.max(width * 0.055, 18) : Math.min(width * 0.065, 26),
			descriptionSize: isTinyScreen ? 13 : Math.min(width * 0.045, 15),
			inputSize: isTinyScreen ? 46 : 52,
			inputFontSize: isTinyScreen ? 18 : 20,
			buttonHeight: isTinyScreen ? 38 : 40,
			buttonFontSize: isTinyScreen ? 14 : 15,
		};
	}, []);

	const handleChangeText = (text, index) => {
		const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

		if (sanitized.length > 1) {
			const chars = sanitized.slice(0, LENGTH).split('');
			const nextValues = Array(LENGTH).fill('');
			chars.forEach((char, idx) => {
				nextValues[idx] = char;
			});
			setValues(nextValues);
			const lastIndex = Math.min(chars.length, LENGTH) - 1;
			if (lastIndex >= 0) {
				inputsRef.current[lastIndex]?.focus();
			}
			return;
		}

		const next = [...values];
		next[index] = sanitized;
		setValues(next);

		if (sanitized && index < LENGTH - 1) {
			inputsRef.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (e, index) => {
		if (e.nativeEvent.key === 'Backspace') {
			if (!values[index] && index > 0) {
				const next = [...values];
				next[index - 1] = '';
				setValues(next);
				inputsRef.current[index - 1]?.focus();
			} else {
				const next = [...values];
				next[index] = '';
				setValues(next);
			}
		}
	};

	const renderInput = (index) => (
		<TextInput
			key={index}
			ref={(el) => (inputsRef.current[index] = el)}
			value={values[index]}
			onChangeText={(text) => handleChangeText(text, index)}
			onKeyPress={(e) => handleKeyPress(e, index)}
			onFocus={() => setFocusedIndex(index)}
			onBlur={() => setFocusedIndex(-1)}
			maxLength={1}
			autoCapitalize="characters"
			keyboardType="default"
			style={{
				width: dimensions.inputSize,
				height: dimensions.inputSize,
				textAlign: 'center',
				fontSize: dimensions.inputFontSize,
				fontWeight: '600',
				borderRadius: 10,
				borderWidth: focusedIndex === index ? 2 : 1,
				borderColor: focusedIndex === index ? '#AE0000' : '#D1D5DB',
				backgroundColor: '#FFF',
				color: '#111',
				marginHorizontal: 16,
				marginVertical: 12,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.06,
				shadowRadius: 8,
				elevation: 2,
			}}
		/>
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
						Insira seu código de verificação
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
						Digite os 6 dígitos enviados para {emailParam || 'seu email cadastrado'}.
					</Text>

					<View style={{ alignItems: 'center', marginBottom: 16 }}>
						<View style={{ flexDirection: 'row' }}>
							{[0, 1, 2].map(renderInput)}
						</View>
						<View style={{ flexDirection: 'row' }}>
							{[3, 4, 5].map(renderInput)}
			</View>
		</View>

		{validando && (
			<View style={{ alignItems: 'center', marginBottom: 12 }}>
				<ActivityIndicator size="small" color="#AE0000" />
				<Text style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>
					Validando código...
				</Text>
			</View>
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

		{!!reenvioErro && (
			<Text
				style={{
					color: '#DC2626',
					textAlign: 'center',
					fontSize: 14,
					marginBottom: 8,
				}}
			>
				{reenvioErro}
			</Text>
		)}					{!!reenvioSucesso && (
						<Text
							style={{
								color: '#16A34A',
								textAlign: 'center',
								fontSize: 14,
								marginBottom: 8,
							}}
						>
							{reenvioSucesso}
						</Text>
					)}

					<View
						style={{
							marginTop: 20,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text style={{ color: '#111', fontSize: 14 }}>Não recebeu o código? </Text>
						<TouchableOpacity
							onPress={handleReenviarCodigo}
							disabled={reenvioTimer > 0 || reenviando}
						>
							<Text
								style={{
									color: reenvioTimer > 0 || reenviando ? '#9CA3AF' : '#2563EB',
									textDecorationLine: 'underline',
									fontWeight: '600',
									fontSize: 14,
								}}
							>
								{reenvioTimer > 0
									? `Reenviar (${formatTimer(reenvioTimer)})`
									: 'Reenviar'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default CodigoRecuperacao;
