import { StyleSheet, SafeAreaView, StatusBar, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const GroupsCard = () => {
  const GroupItem = ({ name, info, color }) => (
    <View style={styles.groupItemContainer}>
      <View style={[styles.groupIconContainer, { backgroundColor: color }]}>
        <Text style={styles.groupInitials}>{name.split(' ')[0][0]}</Text>
      </View>
      <View>
        <Text style={styles.groupName}>{name}</Text>
        <Text style={styles.groupInfo}>{info}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.cardCortainer}>
      <View style={styles.groupsCardHeader}>
        <FontAwesome name="users" size={24} color="#6C5CE7" style={styles.GroupItem} />
        <Text style={styles.groupsCardTitle}>Meus Grupos</Text>
      </View>
      <GroupItem name="Desafio Powerlifting" info="3 check-ins essa semana" color="#6C5CE7" />
      <GroupItem name="Grupo Cardio 20min" info="Próxima recompensa: café" color="#00A86B" />
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
    groupsCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    groupsCardIcon: {
        marginRight: 10,
        fontSize: 24,
    },
    groupsCardTitle: {
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    groupItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    groupIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    groupInitials: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    groupName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    groupInfo: {
        color: '#a0a0a0',
        fontSize: 12,
        marginTop: 2,
    },
});
export default GroupsCard