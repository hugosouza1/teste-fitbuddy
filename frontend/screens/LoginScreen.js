import { StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Logo from '../../assets/images/Logo.png';
import useLogin from "../hooks/login/useLogin";

const LoginScreen = ({ onNavigate }) => {
  const { senha, setSenha, email, setEmail, loading, loginVerif } = useLogin();

const loginCheck = async () => {
  const ret = await loginVerif();
  if (ret) {
    onNavigate('home');
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
              onPress={loginCheck}
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