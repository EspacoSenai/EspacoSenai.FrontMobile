import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// SVG assets  
import SetaLeftIcon from '../../../assets/setawhiteleft.svg';
import SinoVazioIcon from '../../../assets/semnotificações1.svg';  
import Ondanotificacoes from '../../../assets/ondanotificacoes.svg';

export default function SemNotificacao() {
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const bellWidth = Math.min(width * 0.5, 320);  

  return (
    <View style={styles.container}>
      {/* Header com onda no topo */}
      <View style={styles.headerContainer}>
        <View style={styles.waveBg} pointerEvents="none">
          <Ondanotificacoes width={width} height={110} preserveAspectRatio="xMidYMid slice" />
        </View>
        <TouchableOpacity
          accessibilityLabel="voltar"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={styles.backButton}
        >
          <SetaLeftIcon width={32} height={32} />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.illustrationWrapper}>
          <SinoVazioIcon width={bellWidth} height={bellWidth * 0.75} preserveAspectRatio="xMidYMid meet" />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.mainTitle}>Tudo tranquilo por aqui!</Text>
          <Text style={styles.primaryText}>Parece que você não tem nenhuma notificação no momento.</Text>
          <Text style={styles.secondaryText}>Avisaremos por aqui assim que houver novidades ou novos agendamentos!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    width: '100%',
    paddingTop: 24,
    paddingLeft: 24,
    paddingBottom: 8,
    position: 'relative',
    height: 110,
    justifyContent: 'flex-start',
  },
  waveBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    overflow: 'hidden',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 0,
    zIndex: 2,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  illustrationWrapper: {
    marginTop: 24,
    marginBottom: 36,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#222',
    lineHeight: 22,
    textAlign: 'center',
  },
});