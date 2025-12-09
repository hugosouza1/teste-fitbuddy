import { useState, useCallback } from 'react';
import * as registerService from '../../services/register/registerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { carregarUsuario } from '../../services/user/userService';

export default function useRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Erro', 'Preencha nome, email e senha.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }

    setLoading(true);
    try {
      const res = await registerService.registerUser(email.trim(), password, name.trim());
      
      if (res.ok) {
        const returnedEmail = res.email || email.trim();
        if (returnedEmail) {
          try {
            await AsyncStorage.setItem('email', returnedEmail);

            try {
            await carregarUsuario(email)
            } catch (err) {
            console.warn('Erro ao carregar usuario (carregarUsuario):', err);
            }

            console.log('Email salvo no AsyncStorage:', returnedEmail);
          } catch (e) {
            console.warn('Falha ao salvar email no AsyncStorage:', e);
          }
        }
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        return true;
      } else {
        const message = res.error || 'Erro ao registrar';
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
  }, [name, email, password, confirmPassword]);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleRegister,
  };
}