import React, { useState } from "react";
import { StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Logo from '../assets/images/Logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onNavigate }) => {
  const [senha, setSenha] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

    const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    
    const loginVerif = async () => {
      console.log('Valores:', { email, senha });
      console.log('onNavigate existe?', !!onNavigate);

      
      if (!email.trim() || !senha) {
        console.log('Campos vazios detectados');
        return Alert.alert('Erro', 'Preencha email e senha.');
      }
  
      setLoading(true);

      try {
        console.log('Tentando logar com:', { email, senha });
        console.log('URL:', `${BACKEND_URL}/api/user/login`);
        
        const res = await fetch(`${BACKEND_URL}/api/user/login`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: senha }) // enviar password
        });
          
        let data = {};
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Resposta não é JSON ou body vazio:", e);
          data = {};
        }

        console.log('fetch result', { ok: res.ok, status: res.status });
        console.log('response body', data);

        if (res.ok) {
          const returnedEmail = data.email || email.trim(); // <-- fallback importante
          if (returnedEmail) {
            try {
              await AsyncStorage.setItem('email', returnedEmail);
              console.log('Email salvo no AsyncStorage:', returnedEmail);
            } catch (e) {
              console.warn('Falha ao salvar email no AsyncStorage:', e);
            }
          }
            onNavigate('home');
          // onNavigate('profile', { email: returnedEmail });

        } else {
          const message = data.error || data.message || 'Erro ao logar';
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
          {/* <FontAwesome5 name="dumbbell" size={40} color="#00C49F" style={styles.iconLogo} /> */}
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.inputGroup}>
            <FontAwesome name="user" size={20} color="#6C5CE7" style={styles.icon} />
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
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#888"
              secureTextEntry
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Botão pressionado");
              console.log("Estado dos campos antes do registro:", {
                email: email.length > 0,
                senha: senha.length > 0,
              });
              loginVerif();
            }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Não possui uma conta? </Text>
            <TouchableOpacity onPress={() => onNavigate("register")}>
              <Text style={styles.link}>Criar conta</Text>
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
    backgroundColor: 'transparent', 
    width: 400,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1F2937',
    width: '90%',
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
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563', // Cor de fundo do input com ícone
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

export default LoginScreen;