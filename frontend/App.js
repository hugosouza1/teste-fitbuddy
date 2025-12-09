import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Navbar from './components/Home/Navbar';
import Header from './components/Home/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RankingScreen from './screens/RankingScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import PartnersScreen from './screens/PartnersScreen';
import GroupScreen from './screens/GroupScreen';
import PartnersNotifications from './screens/PartnersNotificationsScreen';
import GroupNotifications from './screens/GroupNotificationsScreen';
import CheckInScreen from './screens/CheckInScreen';


export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      case 'register':
        return <RegisterScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'partners':
        return (
          <>
            <Header onNavigate={setCurrentScreen} />
            <PartnersScreen onNavigate={setCurrentScreen} />
            <Navbar currentPage="partners" onNavigate={setCurrentScreen} />
          </>
        );
      case 'profile':
        return (
          <>
            <Header currentPage={currentScreen} onNavigate={setCurrentScreen}/>
            <ProfileScreen onNavigate={setCurrentScreen} />
            <Navbar currentPage="profile" onNavigate={setCurrentScreen} />
          </>
        );
      case 'groups':
        return (
          <>
            <Header currentPage={currentScreen} onNavigate={setCurrentScreen}/>
            <GroupScreen onNavigate={setCurrentScreen} />
            <Navbar currentPage="groups" onNavigate={setCurrentScreen} />
          </>
        );

      case 'partnersNotifications': 
        return (
          <>
            <Header currentPage={currentScreen} onNavigate={setCurrentScreen}/>
            <PartnersNotifications/>
            <Navbar currentPage="" onNavigate={setCurrentScreen}/>
          </>
        );

      case 'groupNotifications':
        return (
          <>
            <Header currentPage={currentScreen} onNavigate={setCurrentScreen}/>
            <GroupNotifications/>
          </>
        )
      case 'checkin':
        return (
          <>
            <Header currentPage={currentScreen} onNavigate={setCurrentScreen}/>
            <CheckInScreen/>
            <Navbar currentPage="" onNavigate={setCurrentScreen}/>
          </>
        );

        case 'ranking':
          return (
            <>
              <Header currentPage={currentScreen} onNavigate={setCurrentScreen} />
              <RankingScreen onNavigate={setCurrentScreen} />
              <Navbar currentPage="ranking" onNavigate={setCurrentScreen} />
            </>
        );
        
      case 'home':
      default:
        return (
          <>
            <Header onNavigate={setCurrentScreen}/>
            <HomeScreen onNavigate={setCurrentScreen} onCheckinPress={setCurrentScreen}/>
            <Navbar currentPage="home" onNavigate={setCurrentScreen} />
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});