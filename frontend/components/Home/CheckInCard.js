import { StyleSheet, View, Text,TouchableOpacity } from 'react-native';


const CheckinCard = ({ onCheckinPress }) => {
  return (
    <View style={styles.cardCortainer} >
      <View style={styles.checkinCardHeader}>
        <Text style={styles.checkinCardTitle}>Pronto para Treinar?</Text>
        <Text style={styles.checkinCardDate}>Hoje, 23 de Setembro</Text>
      </View>
      <Text style={styles.checkinCardDescription}>
        Registre seu treino e entre no ranking do seu grupo.
      </Text>
      <TouchableOpacity
        onPress={onCheckinPress}
        style={styles.checkinCardButton}
      >
        <Text style={styles.checkinCardButtonText}>Fazer Check-in</Text>
      </TouchableOpacity>
    </View>
  )
}
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
    checkinCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkinCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    checkinCardDate: {
        fontSize: 10.5,
        color: '#a0a0a0',
    },
    checkinCardDescription: {
        color: '#a0a0a0',
        marginBottom: 15,
        fontSize: 13
    },
    checkinCardButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    checkinCardButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
})

export default CheckinCard