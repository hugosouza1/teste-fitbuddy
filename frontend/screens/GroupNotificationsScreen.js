import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native'
import GroupInvitesList from '../components/GroupNotification/GroupInvitesList'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'


const GroupNotificationsScreen = () => {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(false)
  const [buttonDisplay, setButtonDisplay] = useState(true)
  
  const fetchNotifications = async () => {
    setLoading(true);
    const userEmail = await AsyncStorage.getItem('email')
    if(!userEmail) throw new Error("Usuário não encontrado")
      
      let url = `${BACKEND_URL}/api/notifications/group/${userEmail}`
      if(invites.length > 0) {
        let elemento = invites[invites.length - 1]
        url += `?from=${elemento.data}`
      }
      
    try {
      const res = await fetch(url)
      const data = await res.json()
      setLoading(false)
      if(!res.ok) {
        return false
      }
      if(data.length < 10) setButtonDisplay(false)
      else setButtonDisplay(true)
      setInvites((prev) => prev.concat(data))
    } catch(err) {
      console.log(err)
      return false
    }
    return true
  }

useEffect(() => {
  const run = async () => {
    const userEmail = await AsyncStorage.getItem('email')
    if(!userEmail) throw new Error("Usuário não encontrado")
    try {
      const loadResult = await fetchNotifications();
      if(loadResult) {
        await fetch(`${BACKEND_URL}/api/notifications/user/${userEmail}/notified`, {
          method: 'PUT'
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  run();
}, []);

 if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C49F" />
        <Text style={styles.loadingText}>Buscando notificações...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.title}>Convites de grupos</Text>
      <GroupInvitesList
        invites={invites}
        onLoadMore={fetchNotifications}
        buttonDisplay={buttonDisplay}
        setInvites={setInvites}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center'
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
})

export default GroupNotificationsScreen
