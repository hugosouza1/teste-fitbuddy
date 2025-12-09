import { useState, useCallback } from 'react';
import * as loginService from '../../services/login/loginService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { carregarUsuario } from '../../services/user/userService';

export default function useLogin() {
  const [senha, setSenha] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loginVerif = useCallback(async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return false;
    }
    setLoading(true);
    try {
      const res = await loginService.loginUser(email.trim(), senha);
      if (res.ok) {
        const returnedEmail = res.email || email.trim();
        if (returnedEmail) {
          try {
            await AsyncStorage.setItem('email', returnedEmail);

            try {
              await carregarUsuario(email);
            } catch (err) {
              console.warn('Erro ao carregar usuario (carregarUsuario):', err);
            }

            console.log('Email salvo no AsyncStorage:', returnedEmail);
            return true;
          } catch (e) {
            console.warn('Falha ao salvar email no AsyncStorage:', e);
            Alert.alert('Erro', 'Não foi possível salvar dados.');
            return false;
          }
        }
      } else {
        const message = res.error || 'Erro ao fazer login';
        Alert.alert('Erro', message);
        return false;
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [email, senha]);

  return {
    senha,
    setSenha,
    email,
    setEmail,
    loading,
    loginVerif,
  };
} 