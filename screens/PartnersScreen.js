import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, View, Alert, ActivityIndicator, FlatList, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PartnerSuggestionCard from '../components/Partner/PartnerSuggestionCard'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const PartnersScreen = ({ navigation }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true); // Começa com um true para carregar os dados
  
  const fetchPartners = async () => {
    const userEmail = await AsyncStorage.getItem('email')
    if(!userEmail) throw new Error("Usuário não encontrado")

    setLoading(true);
    try {
        const url = `${BACKEND_URL}/api/partners/suggestions/${userEmail}`;
        console.log('Buscando sugestões em:', url);

        const response = await fetch(url);
        const data = await response.json();

        if(response.ok) {
          setPartners(data);
        } else {
          Alert.alert('Erro', `Falha ao carregar parceiros: ${data.error || 'Erro desconhecido'}`);
          setPartners([]);
        }
    } catch (error) {
        console.error('Erro ao conectar ou buscar parceiros:', error);
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor de sugestões.');
        setPartners([]);
    } finally {
        setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchPartners();
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C49F" />
        <Text style={styles.loadingText}>Buscando parceiros compatíveis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sugestões de Parceiros</Text>
        <Text style={styles.headerSubtitle}>
          {partners.length > 0
            ? `Encontramos ${partners.length} perfis que combinam com você.`
            : 'Nenhuma sugestão encontrada. Tente atualizar seu perfil.'}
        </Text>
      </View>
      
      {/* Lista de Parceiros */}
      <FlatList
        data={partners}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <PartnerSuggestionCard 
            partner={item} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading && partners.length === 0 ? (
            <Text style={styles.emptyListText}>Não há novos parceiros para sugerir no momento.</Text>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', 
    paddingTop: 0, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#00C49F',
    fontSize: 18,
    marginTop: 10,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#9CA3AF',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20, 
    paddingTop: 20, 
    backgroundColor: 'transparent',
    marginBottom: 10,
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0, 
    shadowColor: 'transparent', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0, 
    elevation: 0, 
    zIndex: 1, 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 15, 
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 0, 
    paddingBottom: 100,
  },
});

export default PartnersScreen;
