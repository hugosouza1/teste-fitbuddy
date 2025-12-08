import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const NotificationsCard = ({ onNotificationsPress }) => {
  return (
    <View style={styles.cardCortainer} >
      <View style={styles.notificationsCardHeader}>
        <Text style={styles.notificationsCardTitle}>Notificações de Amizade</Text>
      </View>
      <Text style={styles.notificationsCardDescription}>
        Confira quem quer se conectar com você!
      </Text>
      <TouchableOpacity
        onPress={onNotificationsPress}
        style={styles.notificationsCardButton}
      >
        <Text style={styles.notificationsCardButtonText}>Ver solicitações</Text>
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
    notificationsCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    notificationsCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    notificationsCardDate: {
        fontSize: 10.5,
        color: '#a0a0a0',
    },
    notificationsCardDescription: {
        color: '#a0a0a0',
        marginBottom: 15,
        fontSize: 13
    },
    notificationsCardButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    notificationsCardButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
})

export default NotificationsCard