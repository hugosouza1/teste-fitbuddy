import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const RankingCard = ({ position, percentage, onRankingPress }) => {
  return (
   <TouchableOpacity style={styles.cardCortainer} onPress={onRankingPress} activeOpacity={0.8}>
      <View style={styles.rankingCardHeader}>
        <FontAwesome5 name="medal" size={24} color="#FFD700" style={styles.rankingCardIco} />
        <Text style={styles.rankingCardTitle}>Seu Ranking</Text>
      </View>

      <View style={styles.rankingCardInfo}>
        <Text style={styles.rankingCardLabel}>Clique para ver sua posição no ranking de grupos</Text>
      </View>

     </TouchableOpacity>
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
  rankingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankingCardIcon: {
    marginRight: 10,
    fontSize: 24,
  },
  rankingCardTitle: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankingCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankingCardLabel: {
    color: '#a0a0a0',
  },
  rankingCardPosition: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C49F',
  },
  progressBarContainer: {
    backgroundColor: '#333',
    height: 10,
    borderRadius: 10,
  },
  progressBar: {
    backgroundColor: '#00C49F',
    height: '100%',
    borderRadius: 10,
  },
  rankingCardFooterText: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 8,
  }
});

export default RankingCard;