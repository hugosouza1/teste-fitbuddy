import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet,View, TouchableOpacity, Image } from 'react-native';
import LogoCompleta from '../../../assets/images/LogoCompleta.png'

const Header = ({onNavigate}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => onNavigate('home')} 
      >
        <Image source={LogoCompleta} style={styles.imgLogo}/>
      </TouchableOpacity>
      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={() => onNavigate('partnersNotifications')}> 
          <FontAwesome style={styles.headerIcon} name="heart" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('groupNotifications')}> 
          <FontAwesome style={styles.headerIcon} name="users" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('profile')}> 
          <FontAwesome style={styles.headerIcon} name="user" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 130,
    paddingHorizontal: 20,
    backgroundColor: '#1F2937',
    paddingTop: '50'
    },
  logoContainer:{
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center'
  },
  headerIcon: {
    marginHorizontal: 8,
  },
  imgLogo:{
    width: 150, 
    height: 100, 
    alignSelf: 'center',
    resizeMode: 'contain',
  },
    icon: {
      marginRight: 8,
      fontSize: 30,
      color: '#00C49F',
  },
   title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
  },
});

export default Header