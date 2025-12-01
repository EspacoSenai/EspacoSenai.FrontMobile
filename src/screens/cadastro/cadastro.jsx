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
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../../assets/logodark.svg';
import OndaMobile from '../../../assets/ondamobile.svg';
import OlhoAberto from '../../../assets/olhoAberto.svg';
import OlhoFechado from '../../../assets/olhoFechado.svg';
import ModalCodigoVerificacao from './ModalCodigoVerificacao';
import { signUpUsuario } from '../../service/authService';

const WAVE_ASPECT_RATIO = 320 / 199;
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
  const [showVerifModal, setShowVerifModal] = useState(false);
  const { width, height } = useWindowDimensions();

  const dimensions = useMemo(() => {

    let waveHeight = height * 0.35;
    let waveWidth = waveHeight * WAVE_ASPECT_RATIO;

    if (waveWidth < width * 1.2) {
      waveWidth = width * 1.2;
      waveHeight = waveWidth / WAVE_ASPECT_RATIO;
    }

    return {
      width,
      height,
      waveHeight,
      waveWidth,
      waveOffset: -height * 0.08,
      logoWidth: width * 0.4,
      logoHeight: width * 0.4 * 0.5625,
      logoTop: height * 0.05,
      cardPaddingHorizontal: width * 0.05,
      cardPaddingVertical: height * 0.03,
      cardMarginTop: height * 0.35,
      titleSize: width * 0.06,
      inputFontSize: width * 0.04,
      inputPadding: height * 0.015,
      fieldSpacing: height * 0.02,
      buttonHeight: height * 0.07,
      buttonFontSize: width * 0.045,
      iconSize: width * 0.055,
    };
  }, [width, height]);
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
      setShowVerifModal(true);
      return;
    }

    // Validações mínimas locais
    if (!nome || !email || !senha || !confirmarSenha) {
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

    const payload = {
      nome: nome.trim(),
      email: email.trim(),
      senha,
    };

    setLoading(true);

    try {
      const data = await signUpUsuario(payload);
      const verificationToken = data?.token || data?.tokenCadastro || data?.verificationToken;

      if (!verificationToken) {
        throw new Error(data?.message || 'Não recebemos o token de verificação.');
      }

      setTokenCadastro(verificationToken);
      setMensagemSucesso(data?.message || 'Cadastro realizado! Verifique seu email.');
      setShowVerifModal(true);
    } catch (error) {
      setErro(true);
      setMensagemErro(error?.message || 'Não foi possível prosseguir.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerifModal(false);
    setTokenCadastro('');
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setMensagemSucesso('Conta confirmada com sucesso! Faça login.');
    navigation.replace('Login');
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

      <ModalCodigoVerificacao
        isOpen={showVerifModal}
        onClose={() => setShowVerifModal(false)}
        token={tokenCadastro}
        length={6}
        onSuccess={handleVerificationSuccess}
      />
    </KeyboardAvoidingView>
  );
};

export default Cadastro;
