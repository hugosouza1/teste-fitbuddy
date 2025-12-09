import { StyleSheet, SafeAreaView, StatusBar, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const Navbar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { name: "home", label: "Home", page: "home" },
    { name: "user-friends", label: "Parceiros", page: "partners" },
    { name: "users", label: "Grupos", page: "groups" },
    { name: "trophy", label: "Ranking", page: "ranking" },
  ];

  return (
    <View style={styles.bottomNavbarContainer}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.page}
          style={styles.navItem}
          onPress={() => onNavigate(item.page)}
        >
          <FontAwesome5
            name={item.name}
            size={24}
            color={currentPage === item.page ? "#1c7ce2" : "#a0a0a0"}
          />
          <Text
            style={
              currentPage === item.page
                ? styles.navTextActive
                : styles.navText
            }
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNavbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    paddingBottom: 25
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#a0a0a0',
    marginTop: 5,
  },
  navTextActive: {
    fontSize: 10,
    color: '#1c7ce2',
    marginTop: 5,
    fontWeight: 'bold',
  },
});

export default Navbar