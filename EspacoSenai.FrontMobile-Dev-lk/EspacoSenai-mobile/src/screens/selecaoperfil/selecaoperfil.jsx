import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import Logo from '../../../assets/logodark.svg';
import OndaMobile from '../../../assets/ondamobile.svg';
import Seta from '../../../assets/seta.svg';


const ProfileButton = ({ label, onPress, dimensions }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonContainer,
        { height: dimensions.buttonHeight },
        pressed && styles.buttonPressed,
      ]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.buttonOverlay, pressed && styles.buttonOverlayVisible]} />
          <View style={styles.buttonContent}>
            <Text style={[
              styles.buttonText,
              { fontSize: dimensions.buttonFontSize },
              pressed && styles.buttonTextPressed
            ]}>
              {label}
            </Text>
            <Seta width={dimensions.iconSize} height={dimensions.iconSize} fill={pressed ? '#FFF' : '#AE0000'} />
          </View>
        </>
      )}
    </Pressable>
  );
};

const SelecaoPerfil = () => {
  const navigation = useNavigation();

  const dimensions = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const isSmallScreen = width < 360;
    const isTinyScreen = width < 340;

    return {
      width,
      height,
      waveHeight: isTinyScreen
        ? Math.min(height * 0.28, 200)
        : isSmallScreen
          ? Math.min(height * 0.32, 240)
          : Math.min(height * 0.35, 280),
      logoWidth: isTinyScreen
        ? Math.max(width * 0.32, 100)
        : Math.min(Math.max(width * 0.4, 120), 180),
      logoHeight: isTinyScreen
        ? Math.max(width * 0.32, 100) * 0.5625
        : Math.min(Math.max(width * 0.4, 120), 180) * 0.5625,
      logoTop: Platform.OS === 'ios'
        ? (isTinyScreen ? Math.max(height * 0.03, 24) : Math.max(height * 0.05, 40))
        : (isTinyScreen ? Math.max(height * 0.025, 20) : Math.max(height * 0.04, 32)),
      cardPadding: isTinyScreen
        ? Math.max(width * 0.04, 12)
        : Math.max(width * 0.055, 16),
      cardPaddingVertical: isTinyScreen
        ? Math.max(height * 0.03, 24)
        : Math.max(height * 0.045, 30),
      titleSize: isTinyScreen
        ? Math.max(width * 0.052, 17)
        : Math.min(width * 0.058, 24),
      buttonFontSize: isTinyScreen
        ? 14
        : Math.min(width * 0.042, 17),
      buttonHeight: isTinyScreen
        ? Math.min(height * 0.055, 44)
        : Math.min(height * 0.065, 56),
      iconSize: isTinyScreen
        ? 18
        : Math.min(width * 0.06, 24),
    };
  }, []);

  const irParaLogin = async (perfil) => {
    try {
      console.log('Função irParaLogin chamada com perfil:', perfil);
      await AsyncStorage.setItem('selected_profile', perfil);
      console.log('Perfil salvo no AsyncStorage:', perfil);
      console.log('Tentando navegar para Login...');
      navigation.navigate('Login');
      console.log('Navigate chamado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar perfil ou navegar:', error);
    }
  };

  const perfis = ['Estudantes', 'Professores', 'Coordenadores', 'Administradores'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Logo - Fixo no topo */}
      <View style={[styles.headerContainer, { top: dimensions.logoTop }]}>
        <Logo width={dimensions.logoWidth} height={dimensions.logoHeight} preserveAspectRatio="xMidYMid meet" />
      </View>

      {/* Onda - Fixa no topo */}
      <View style={[styles.topWaveContainer, { height: dimensions.waveHeight, top: -20 }]}>
        <OndaMobile width={dimensions.width * 1.1} height={dimensions.waveHeight} preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* ScrollView com Card abaixo da onda */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: dimensions.waveHeight + 34, // Card fica abaixo da onda com espaçamento
          }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[
          styles.card,
          {
            paddingVertical: dimensions.cardPaddingVertical,
            paddingHorizontal: dimensions.cardPadding
          }
        ]}>
          <Text style={[styles.title, { fontSize: dimensions.titleSize }]}>
            Selecione um perfil{'\n'}para acessar!
          </Text>
          <View style={styles.buttonList}>
            {perfis.map((label) => (
              <ProfileButton
                key={label}
                label={label}
                onPress={() => irParaLogin(label)}
                dimensions={dimensions}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  topWaveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
    overflow: 'hidden',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 12,
    zIndex: 10,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#1f2687',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Poppins' : 'sans-serif',
    fontWeight: '600',
    lineHeight: 30,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonList: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#AE0000',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonPressed: {
    borderColor: '#000',
    transform: [{ scale: 0.98 }],
  },
  buttonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#AE0000',
    opacity: 0,
  },
  buttonOverlayVisible: {
    opacity: 1,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  buttonText: {
    fontWeight: '500',
    color: '#333',
  },
  buttonTextPressed: {
    color: '#FFF',
  },
});

export default SelecaoPerfil;
