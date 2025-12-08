import { StyleSheet, SafeAreaView, StatusBar, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const PartnerCard = () => {
  return (
    <View style={styles.cardCortainer} >
      <View style={styles.partnerCardHeader}>
        <FontAwesome5 name="user-friends" size={24} color="#E86E8D" style={styles.partnerCardIcon} />
        <Text style={styles.partnerCardTitle}>Encontre um Parceiro</Text>
      </View>
      <Text style={styles.partnerCardDescription}>
        Encontre alguém com o mesmo objetivo de treino para te motivar.
      </Text>
      <TouchableOpacity
        style={styles.partnerCardButton}
      >
        <Text style={styles.partnerCardButtonText}>Encontrar Agora</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    cardCortainer: {
        backgroundColor: '#1F2937',
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '100%',
        borderRadius: 15,
        elevation: 5
    },
    partnerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  partnerCardIcon: {
    marginRight: 10,
    fontSize: 24,
  },
  partnerCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  partnerCardDescription: {
    color: '#a0a0a0',
    marginBottom: 15,
  },
  partnerCardButton: {
    backgroundColor: '#DB2777',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  partnerCardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
})

export default PartnerCard