import React, { useMemo } from 'react';
import {
  Text,
  Pressable,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../../assets/logodark.svg';
import OndaMobile from '../../../assets/ondamobile.svg';
import Seta from '../../../assets/seta.svg';

const ProfileButton = ({ label, onPress, dimensions }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
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
        height: dimensions.buttonHeight,
      },
      pressed && {
        borderColor: '#000',
        transform: [{ scale: 0.98 }],
      },
    ]}
  >
    {({ pressed }) => (
      <>
        <View
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: '#AE0000',
              opacity: 0,
            },
            pressed && { opacity: 1 },
          ]}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              fontWeight: '500',
              color: pressed ? '#FFF' : '#333',
              fontSize: dimensions.buttonFontSize,
            }}
          >
            {label}
          </Text>

          <Seta
            width={dimensions.iconSize}
            height={dimensions.iconSize}
            fill={pressed ? '#FFF' : '#AE0000'}
          />
        </View>
      </>
    )}
  </Pressable>
);

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
      waveOffset: isTinyScreen
        ? -Math.max(height * 0.05, 24)
        : -Math.max(height * 0.06, 40),
      logoWidth: isTinyScreen
        ? Math.max(width * 0.34, 100)
        : Math.min(Math.max(width * 0.42, 135), 190),
      logoHeight: isTinyScreen
        ? Math.max(width * 0.34, 100) * 0.5625
        : Math.min(Math.max(width * 0.42, 135), 190) * 0.5625,
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
      await AsyncStorage.setItem('selected_profile', perfil);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao salvar perfil ou navegar:', error);
    }
  };

  const perfis = ['Estudantes', 'Professores', 'Coordenadores', 'Administradores'];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FFF',
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 30,
          top: dimensions.logoTop,
        }}
      >
        <Logo
          width={dimensions.logoWidth}
          height={dimensions.logoHeight}
          preserveAspectRatio="xMidYMid meet"
        />
      </View>

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
          width={dimensions.width * 1.1}
          height={dimensions.waveHeight}
          preserveAspectRatio="xMidYMid slice"
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 48,
          paddingTop: Math.max(dimensions.waveHeight * 0.99, 140),
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#FFF',
            borderRadius: 12,
            zIndex: 10,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            paddingVertical: dimensions.cardPaddingVertical,
            paddingHorizontal: dimensions.cardPadding,
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
          }}
        >
          <Text
            style={{
              fontFamily: Platform.OS === 'ios' ? 'Poppins' : 'sans-serif',
              fontWeight: '600',
              lineHeight: 30,
              color: '#000',
              textAlign: 'center',
              marginBottom: 24,
              fontSize: dimensions.titleSize,
            }}
          >
            Selecione um perfil{'\n'}para acessar!
          </Text>

          <View
            style={{
              width: '100%',
              alignItems: 'center',
              gap: 16,
            }}
          >
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

export default SelecaoPerfil;
