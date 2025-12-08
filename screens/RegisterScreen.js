import React, { useState } from "react";
import { StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Logo from '../assets/images/Logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Backend URL: usa 10.0.2.2 no emulador Android, localhost no iOS / web

const RegisterScreen = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

  const handleRegister = async () => {
    console.log('Botão de registro clicado');
    console.log('Valores:', { name, email, password, confirmPassword });
    console.log('onNavigate existe?', !!onNavigate);
    
    if (!name.trim() || !email.trim() || !password) {
      console.log('Campos vazios detectados');
      return Alert.alert('Erro', 'Preencha nome, email e senha.');
    }
    if (password !== confirmPassword) {
      console.log('Senhas não coincidem');
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    setLoading(true);
    try {
      console.log('Tentando registrar com:', { name, email });
      console.log('URL:', `${BACKEND_URL}/api/user/register`);
      
      const res = await fetch(`${BACKEND_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      console.log('Status da resposta:', res.status);
      const data = await res.json().catch((e) => {
        console.error('Erro ao parsear resposta:', e);
        return {};
      });

      if (res.ok) {
        
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        const returnedEmail = data.email || email.trim();
        if (returnedEmail) {
          try {
            await AsyncStorage.setItem('email', returnedEmail);
            console.log('Email salvo no AsyncStorage:', returnedEmail);
          } catch (e) {
            console.warn('Falha ao salvar email no AsyncStorage:', e);
          }
        }

        onNavigate('home');
      } else {
        const message = data.error || data.message || 'Erro ao registrar';
        Alert.alert('Erro', message);
      }
    } catch (err) {
      console.error('Erro ao conectar ao backend:', err);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
              <Image source={Logo} style={styles.imgLogo} />
          </View>
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.inputGroup}>
            <FontAwesome name="user-plus" size={20} color="#6C5CE7" style={styles.icon} />
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Nome de Usuário"
              placeholderTextColor="#888"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="envelope" size={20} color="#6C5CE7" style={styles.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="lock" size={20} color="#6C5CE7" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#888"
              secureTextEntry
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="lock" size={20} color="#6C5CE7" style={styles.icon} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor="#888"
              secureTextEntry
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={() => {
              console.log('Botão pressionado');
              console.log('Estado dos campos antes do registro:', {
                name: name.length > 0,
                email: email.length > 0,
                password: password.length > 0,
                confirmPassword: confirmPassword.length > 0
              });
              handleRegister();
            }}
            disabled={loading}
            >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Registrar</Text>}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={() => onNavigate("login")}>
                <Text style={styles.link}>Acessar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Fundo escuro
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1F2937',
    width: '90%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoContainer:{
    justifyContent: 'center',
    alignItems: 'center'
  },
  imgLogo:{
    width: 150, 
    height: 100, 
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  iconLogo: {
    margin: 'auto',
    marginBottom: '15',
    
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFF',
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#AAA',
    fontSize: 14,
  },
  link: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;