import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import ModalCodigoVerificacao from './ModalCodigoVerificacao';

const ModalCodigoVerificacaoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    token,
    length = 6,
    redirectTo = 'Login',
    redirectParams,
  } = route.params || {};

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSuccess = () => {
    if (redirectTo) {
      navigation.replace(redirectTo, redirectParams);
      return;
    }
    navigation.goBack();
  };

  return (
    <ModalCodigoVerificacao
      isOpen
      token={token}
      length={length}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default ModalCodigoVerificacaoScreen;
