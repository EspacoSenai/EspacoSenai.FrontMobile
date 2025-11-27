import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../../assets/logodark.svg';
import OndaMobile from '../../../assets/ondamobile.svg';
import OlhoAberto from '../../../assets/olhoAberto.svg';
import OlhoFechado from '../../../assets/olhoFechado.svg';
import { signUpUsuario } from '../../service/authService';

const getForcaSenha = (senha) => {
  if (!senha) return '';
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^a-zA-Z0-9]/.test(senha);
  if (senha.length < 6) return 'fraca';
  if (senha.length >= 6 && temLetra && temNumero && !temEspecial) return 'media';
  if (senha.length >= 8 && temLetra && temNumero && temEspecial) return 'forte';
  return 'fraca';
};

const Cadastro = () => {
  const navigation = useNavigation();
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const senhaRef = useRef(null);
  const confRef = useRef(null);

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [forcaSenha, setForcaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenCadastro, setTokenCadastro] = useState('');

  const dimensions = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const isSmallScreen = width < 360;
    const isTinyScreen = width < 340;

    const waveHeight = isTinyScreen
      ? Math.min(height * 0.28, 200)
      : isSmallScreen
        ? Math.min(height * 0.32, 240)
        : Math.min(height * 0.35, 280);

    return {
      width,
      height,
      waveHeight,
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
      cardPaddingHorizontal: isTinyScreen ? Math.max(width * 0.04, 16) : Math.max(width * 0.05, 20),
      cardPaddingVertical: isTinyScreen ? 18 : 20,
      cardMarginTop: Math.max(waveHeight * 0.75, height * 0.34),
      titleSize: isTinyScreen ? Math.max(width * 0.054, 18) : Math.min(width * 0.06, 26),
      inputFontSize: isTinyScreen ? 14 : Math.min(width * 0.042, 16),
      inputPadding: isTinyScreen ? 12 : 14,
      fieldSpacing: isTinyScreen ? 12 : 14,
      buttonHeight: isTinyScreen ? 22 : 38,
      buttonFontSize: isTinyScreen ? 12 : 15,
      iconSize: isTinyScreen ? 18 : Math.min(width * 0.055, 22),
    };
  }, []);

  const abrirModalVerificacao = (token) => {
    if (!token) return;
    navigation.navigate('ModalCodigoVerificacao', {
      token,
      redirectTo: 'Login',
    });
  };

  const getStrengthColor = () => {
    if (forcaSenha === 'fraca') return '#EF4444';
    if (forcaSenha === 'media') return '#FBBF24';
    return '#22C55E';
  };

  const getStrengthWidth = () => {
    if (forcaSenha === 'fraca') return '33%';
    if (forcaSenha === 'media') return '66%';
    return '100%';
  };

  const handleSubmit = async () => {
    setErro(false);
    setMensagemErro('');
    setMensagemSucesso('');

    if (tokenCadastro) {
      abrirModalVerificacao(tokenCadastro);
      return;
    }

    if (!nome || !email || !senha || (!tokenCadastro && !confirmarSenha)) {
      setErro(true);
      setMensagemErro('Preencha todos os campos obrigatórios.');
      if (!nome) nomeRef.current?.focus();
      else if (!email) emailRef.current?.focus();
      else if (!senha) senhaRef.current?.focus();
      else confRef.current?.focus();
      return;
    }

    if (!tokenCadastro && senha !== confirmarSenha) {
      setErro(true);
      setMensagemErro('As senhas não coincidem.');
      confRef.current?.focus();
      return;
    }

    if (senha.length < 8 || senha.length > 15) {
      setErro(true);
      setMensagemErro('A senha deve ter entre 8 e 15 caracteres.');
      senhaRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const resp = await signUpUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tag: null,
      });

      const token = resp?.token ?? null;
      const msg = resp?.message || 'Código enviado para seu e-mail.';

      if (token) {
        setTokenCadastro(token);
        setMensagemSucesso(msg);
        abrirModalVerificacao(token);
      } else {
        setErro(true);
        setMensagemErro('Erro ao receber token de verificação. Tente novamente.');
      }
    } catch (error) {
      setErro(true);
      setMensagemErro(error?.message || 'Não foi possível realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (senha === confirmarSenha && erro && !mensagemErro) {
      setErro(false);
    }
  }, [senha, confirmarSenha, erro, mensagemErro]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#FFF' }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: 40,
          minHeight: dimensions.height,
        }}
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
            width={dimensions.width * 1.1}
            height={dimensions.waveHeight}
            preserveAspectRatio="xMidYMid slice"
          />
        </View>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
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
            width: '90%',
            maxWidth: 420,
            marginTop: dimensions.cardMarginTop,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: dimensions.titleSize,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: dimensions.fieldSpacing,
              color: '#000',
              lineHeight: 30,
            }}
          >
            Bem-Vindo(a) ao {'\n'}
            <Text style={{ fontWeight: '700' }}>EspaçoSenai!</Text>
          </Text>

          <View
            style={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: 16,
              paddingHorizontal: dimensions.cardPaddingHorizontal,
              paddingVertical: dimensions.cardPaddingVertical,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.12,
              shadowRadius: 18,
              elevation: 10,
            }}
          >
            {!!mensagemErro && (
              <Text
                style={{
                  color: '#DC2626',
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                {mensagemErro}
              </Text>
            )}

            {!!mensagemSucesso && (
              <Text
                style={{
                  color: '#16A34A',
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                {mensagemSucesso}
              </Text>
            )}

            <TextInput
              ref={nomeRef}
              placeholder="Nome"
              placeholderTextColor="#666"
              style={{
                backgroundColor: '#F5F5F5',
                borderColor: erro && !nome ? '#DC2626' : 'transparent',
                borderWidth: erro && !nome ? 1 : 0,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: dimensions.inputPadding,
                fontSize: dimensions.inputFontSize,
                color: '#000',
                marginBottom: dimensions.fieldSpacing,
              }}
              value={nome}
              onChangeText={setNome}
              editable={!tokenCadastro}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

          <TextInput
            ref={emailRef}
            placeholder="Email"
            placeholderTextColor="#666"
            style={{
              backgroundColor: '#F5F5F5',
              borderColor: erro && !email ? '#DC2626' : 'transparent',
              borderWidth: erro && !email ? 1 : 0,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: dimensions.inputPadding,
              fontSize: dimensions.inputFontSize,
              color: '#000',
              marginBottom: dimensions.fieldSpacing,
            }}
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
            editable={!tokenCadastro}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
            blurOnSubmit={false}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F5F5F5',
              borderColor: erro && !senha ? '#DC2626' : 'transparent',
              borderWidth: erro && !senha ? 1 : 0,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <TextInput
              ref={senhaRef}
              placeholder="Senha"
              placeholderTextColor="#666"
              style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingVertical: dimensions.inputPadding,
                fontSize: dimensions.inputFontSize,
                color: '#000',
              }}
              value={senha}
              onChangeText={(value) => {
                setSenha(value);
                setForcaSenha(getForcaSenha(value));
              }}
              editable={!tokenCadastro}
              secureTextEntry={!showSenha}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => setShowSenha(!showSenha)}
              style={{ padding: 14 }}
            >
              {showSenha ? (
                <OlhoAberto width={dimensions.iconSize} height={dimensions.iconSize} />
              ) : (
                <OlhoFechado width={dimensions.iconSize} height={dimensions.iconSize} />
              )}
            </TouchableOpacity>
          </View>

          {senha.length > 0 && !tokenCadastro && (
            <View style={{ marginTop: -8, marginBottom: dimensions.fieldSpacing }}>
              <View
                style={{
                  height: 6,
                  width: '100%',
                  backgroundColor: '#E5E7EB',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: getStrengthWidth(),
                    backgroundColor: getStrengthColor(),
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: getStrengthColor(),
                  }}
                >
                  Força: {forcaSenha.charAt(0).toUpperCase() + forcaSenha.slice(1)}
                </Text>
                {forcaSenha === 'fraca' && (
                  <Text style={{ fontSize: 10, color: '#DC2626' }}>
                    Recomendamos senha forte
                  </Text>
                )}
              </View>
            </View>
          )}

          {!tokenCadastro && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F5F5F5',
                borderColor: erro && !confirmarSenha ? '#DC2626' : 'transparent',
                borderWidth: erro && !confirmarSenha ? 1 : 0,
                borderRadius: 12,
                marginBottom: dimensions.fieldSpacing,
              }}
            >
              <TextInput
                ref={confRef}
                placeholder="Confirmar senha"
                placeholderTextColor="#666"
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: dimensions.inputPadding,
                  fontSize: dimensions.inputFontSize,
                  color: '#000',
                }}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showConfirmar}
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmar(!showConfirmar)}
                style={{ padding: 14 }}
              >
                {showConfirmar ? (
                  <OlhoAberto width={dimensions.iconSize} height={dimensions.iconSize} />
                ) : (
                  <OlhoFechado width={dimensions.iconSize} height={dimensions.iconSize} />
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: '#AE0000',
              height: dimensions.buttonHeight,
              width: '75%',
              alignSelf: 'center',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#AE0000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text
                style={{
                  color: '#FFF',
                  fontSize: dimensions.buttonFontSize,
                  fontWeight: '700',
                }}
              >
                {tokenCadastro ? 'Verificar' : 'Começar'}
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: dimensions.fieldSpacing,
            }}
          >
            <Text style={{ fontSize: 14, color: '#000' }}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#2563EB',
                  textDecorationLine: 'underline',
                  fontWeight: '600',
                }}
              >
                Entre aqui
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Cadastro;
