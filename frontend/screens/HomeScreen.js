import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import CheckinCard from '../components/Home/CheckInCard';
import RankingCard from '../components/Home/RankingCard';
import PartnerCard from '../components/Home/PartnerCard';
import NotificationsCard from '../components/Home/NotificationsCard';

import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ onNavigate, onCheckinPress }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem('email');
        if (stored) {
          setEmail(stored);
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
      <CheckinCard onCheckinPress={() => onNavigate('checkin')} />
      <RankingCard position={3} percentage={75} onRankingPress={() => onNavigate('ranking')}  />
      <NotificationsCard onNotificationsPress={() => onNavigate('partnersNotifications')} />
      <PartnerCard onPartnerPress={() => onNavigate('partners')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 10,
    paddingBottom: 90,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
});

export default HomeScreen;
