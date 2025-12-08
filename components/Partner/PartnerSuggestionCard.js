import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { enviarSolicitacaoDeAmizade } from '../../services/friendshipService';
import AsyncStorage from '@react-native-async-storage/async-storage';

  const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const PartnerSuggestionCard = ({ partner }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); 

  const handleConnect = async () => {
    if(sent) return;

    setLoading(true);
    const success = await enviarSolicitacaoDeAmizade(BACKEND_URL, partner.email)
    if(success) {
      setTimeout(() => {
        setLoading(false);
        setSent(true);
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
        setSent(false);
        Alert.alert('Falha', `Infelizmente ocorreu um erro ao enviar uma solicitação para ${partner.nome}!`);
      }, 1000);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: partner.foto }} style={styles.profilePic} />
        <View style={styles.info}>
          <Text style={styles.name}>{partner.nome}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, sent && styles.buttonSent, loading && { opacity: 0.7 }]}
        onPress={handleConnect}
        disabled={loading || sent}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            {sent ? 'Solicitação Enviada' : 'Enviar Solicitação'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  focus: {
    fontSize: 14,
    color: '#00C49F',
    marginTop: 2,
  },
  level: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSent: {
    backgroundColor: '#00C49F',
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PartnerSuggestionCard;
