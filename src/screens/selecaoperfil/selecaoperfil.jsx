import React, { useMemo } from 'react';
import {
  Text,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
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

const WAVE_ASPECT_RATIO = 320 / 199; 

const SelecaoPerfil = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const dimensions = useMemo(() => {
    let waveHeight = height * 0.35;
    let waveWidth = waveHeight * WAVE_ASPECT_RATIO;

    // amplia proporcionalmente sempre que a largura visível for maior
    if (waveWidth < width) {
      waveWidth = width;
      waveHeight = waveWidth / WAVE_ASPECT_RATIO;
    }

    return {
      width,
      height,
      waveHeight,
      waveWidth,
      waveOffset: -height * 0.07,
    logoWidth: width * 0.42,
    logoHeight: width * 0.42 * 0.5625,
    logoTop: height * 0.05,
    cardPadding: width * 0.05,
    cardPaddingVertical: height * 0.04,
    titleSize: width * 0.06,
    buttonFontSize: width * 0.045,
    buttonHeight: height * 0.065,
    iconSize: width * 0.055,
    scrollPaddingTop: height * 0.4,
    };
  }, [width, height]);

  const irParaLogin = async (perfil) => {
    try {
      await AsyncStorage.setItem('selected_profile', perfil.value);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao salvar perfil ou navegar:', error);
    }
  };
  const perfis = [
    { label: 'Estudantes', value: 'ALUNO' },
    { label: 'Professores', value: 'PROFESSOR' },
    { label: 'Coordenadores', value: 'COORDENADOR' },
    { label: 'Administradores', value: 'ADMIN' },
  ];

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
          width={dimensions.waveWidth}
          height={dimensions.waveHeight}
          preserveAspectRatio="xMidYMid slice"
          style={{
            transform: [
              { translateX: -(dimensions.waveWidth - dimensions.width) / 2 },
            ],
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: dimensions.width * 0.05,
          paddingBottom: height * 0.08,
          paddingTop: dimensions.scrollPaddingTop,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={{
            width: '90%',
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
            {perfis.map((perfil) => (
              <ProfileButton
                key={perfil.value}
                label={perfil.label}
                onPress={() => irParaLogin(perfil)}
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
