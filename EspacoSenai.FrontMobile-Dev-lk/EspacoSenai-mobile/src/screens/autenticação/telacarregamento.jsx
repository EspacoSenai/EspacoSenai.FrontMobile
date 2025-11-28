import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Logo from '../../../assets/EspacoSenai.svg';

const NEXT_ROUTE = 'SelecionarPerfil';
const ANIMATION_DURATION = 900;
const SPLASH_DURATION = 2200;

const TelaCarregamento = () => {
	const navigation = useNavigation();
	const opacity = useRef(new Animated.Value(0)).current;
	const scale = useRef(new Animated.Value(0.85)).current;
	const glow = useRef(new Animated.Value(0)).current;

	const sizes = useMemo(() => {
		const { width } = Dimensions.get('window');
		return {
			logoSize: Math.min(Math.max(width * 0.4, 160), 220),
			ringSize: Math.min(Math.max(width * 0.6, 220), 320),
		};
	}, []);

	useEffect(() => {
		const fadeIn = Animated.timing(opacity, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		});

		const pulse = Animated.loop(
			Animated.sequence([
				Animated.timing(scale, {
					toValue: 1,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
				Animated.timing(scale, {
					toValue: 0.85,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
			])
		);

		const ripple = Animated.loop(
			Animated.sequence([
				Animated.timing(glow, {
					toValue: 1,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
				Animated.timing(glow, {
					toValue: 0,
					duration: ANIMATION_DURATION,
					useNativeDriver: true,
				}),
			])
		);

		fadeIn.start();
		pulse.start();
		ripple.start();

		const timeout = setTimeout(() => {
			pulse.stop();
			ripple.stop();
			navigation.reset({ index: 0, routes: [{ name: NEXT_ROUTE }] });
		}, SPLASH_DURATION);

		return () => {
			pulse.stop();
			ripple.stop();
			clearTimeout(timeout);
		};
	}, [glow, navigation, opacity, scale]);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			<Animated.View
				style={[
					styles.glow,
					{
						width: sizes.ringSize,
						height: sizes.ringSize,
						borderRadius: sizes.ringSize / 2,
						opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
						transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
					},
				]}
			/>
			<Animated.View style={{ opacity, transform: [{ scale }] }}>
				<Logo width={sizes.logoSize} height={sizes.logoSize * 0.75} />
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 48,
	},
	glow: {
		position: 'absolute',
		backgroundColor: '#FFEEF0',
	},
});

export default TelaCarregamento;
