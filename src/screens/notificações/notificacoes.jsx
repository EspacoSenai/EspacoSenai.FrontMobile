import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, PanResponder } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Import SVGs as components (no require)
import SetaLeftIcon from '../../../assets/setaleft.svg';
import SinoSNIcon from '../../../assets/sinoSN.svg';
import LembreteIcon from '../../../assets/lembrete.svg';

// Array vazio - notificações virão da API ou push notifications
const notificacoesIniciais = [];

export default function Notificacoes() {
  const navigation = useNavigation();
  const [notificacoes, setNotificacoes] = useState(notificacoesIniciais);

  // Redireciona imediatamente se estiver vazio ao montar
  useLayoutEffect(() => {
    if (notificacoes.length === 0) {
      const t = setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'SemNotificacao' }] });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [notificacoes, navigation]);

  // Também verifica sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      if (notificacoes.length === 0) {
        const t = setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'SemNotificacao' }] });
        }, 0);
        return () => clearTimeout(t);
      }
      return undefined;
    }, [notificacoes, navigation])
  );

  // Back to previsão screen
  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const removerNotificacao = (id) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  // Enquanto redireciona, evita renderizar a tela (previne flicker)
  if (notificacoes.length === 0) {
    return null;
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity accessibilityLabel="voltar" onPress={goBack} style={styles.backButton}>
        <SetaLeftIcon width={24} height={24} />
      </TouchableOpacity>
      <View style={styles.headerTitleRow}>
        <SinoSNIcon width={24} height={24} />
        <Text style={styles.headerTitle}>Suas notificações</Text>
      </View>
    </View>
  );

  const renderBanner = () => (
    notificacoes.length > 0 ? (
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Você tem novas notificações!</Text>
        <Text style={styles.bannerSubtitle}>Confira as atualizações mais recentes para ficar sempre atualizado.</Text>
      </View>
    ) : null
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sem notificações</Text>
      <Text style={styles.emptySubtitle}>Você verá suas atualizações aqui quando houver novidades.</Text>
    </View>
  );

  const Item = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
          onPanResponderMove: (_, gesture) => {
            const x = Math.min(0, gesture.dx);
            translateX.setValue(x);
          },
          onPanResponderRelease: (_, gesture) => {
            const shouldDelete = gesture.dx < -100;
            if (shouldDelete) {
              removerNotificacao(item.id);
            } else {
              Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            }
          },
          onPanResponderTerminate: () => {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          },
        }),
      [item.id]
    );

    return (
      <View style={styles.card}>
        <Animated.View style={[styles.cardInner, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
          <LembreteIcon width={24} height={24} />
          <View style={styles.cardContent}>
            <Text style={styles.cardBody}>{item.body}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderBanner()}

      {notificacoes.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <Item item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 12,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  headerTitleRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: '#7c0c15',
  },
  swipeHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  banner: {
    backgroundColor: '#7c0c15',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: '#ffffff',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.9,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  cardBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  icon24: {
    // Mantido caso precise em outros lugares; SVG já recebe width/height via props
    width: 24,
    height: 24,
  },
});