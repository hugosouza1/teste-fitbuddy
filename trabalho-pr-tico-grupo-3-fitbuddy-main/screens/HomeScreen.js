import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import CheckinCard from '../components/Home/CheckInCard';
import RankingCard from '../components/Home/RankingCard';
import PartnerCard from '../components/Home/PartnerCard';
import GroupsCard from '../components/Home/GroupsCard';
import NotificationsCard from '../components/Home/NotificationsCard';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { carregarUsuario } from '../services/userService';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const HomeScreen = ({ onNavigate, onCheckinPress }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null); // opcional: guardar dados do usuário 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem('email');
        if (stored) {
          setEmail(stored);
          // carrega o usuário com o email recuperado
          try {
            const data = await carregarUsuario(stored, BACKEND_URL);
            setUser(data || null);
          } catch (err) {
            console.warn('Erro ao carregar usuario (carregarUsuario):', err);
          }
        } else {
          console.warn('Nenhum email no AsyncStorage');
        }
      } catch (e) {
        console.warn('Erro ao ler AsyncStorage (userEmail):', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []); 

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <CheckinCard onCheckinPress={onCheckinPress} />
      <RankingCard position={3} percentage={75} />
      <NotificationsCard onNotificationsPress={() => onNavigate('partnersNotifications')} />
      <PartnerCard />
      <GroupsCard />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 10,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
});

export default HomeScreen;
