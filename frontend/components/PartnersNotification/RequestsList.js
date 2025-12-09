import { FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import {aceitarSolicitacaoDeAmizade, negarSolicitacaoDeAmizade} from "../../services/friend/friendshipService"

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

const RequestsList = ({ solicitacoes, buttonDisplay, onLoadMore, setSolicitacoes }) => {

  const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

  const onAccept = async (partner) => {
    const success = await aceitarSolicitacaoDeAmizade(BACKEND_URL, partner.email)
  
    if(success) {
      setSolicitacoes(prev =>
        prev.filter(item => item.email !== partner.email)
      )
    }
  }

  const onReject = async (partner) => {
    const success = await negarSolicitacaoDeAmizade(BACKEND_URL, partner.email)

    if(success) {
      setSolicitacoes(prev =>
        prev.filter(item => item.email !== partner.email)
      )
    }
  }

  return (
    <FlatList
      data={solicitacoes}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{
        alignItems: 'center',
      }}
      renderItem={({ item }) => (
        <View style={[styles.card, item.nova_solicitacao && styles.nova]}>
          {item.foto && (
            <Image source={{ uri: item.foto }} style={styles.userPicture} />
          )}
          <Text style={styles.tempo}>{dayjs(item.data).fromNow()}</Text>
          <View style={styles.cardContainer}>
            <Text  numberOfLines={1} ellipsizeMode="tail" style={styles.name}>{item.nome}</Text>
            <View style={styles.buttonsContainer}>
              <Pressable title="Aceitar" style={[styles.button, styles.accept]} onPress={() => {onAccept(item)}}>
                <Text style={styles.buttonText}>Aceitar</Text>
              </Pressable>
              <Pressable title="Rejeitar" style={[styles.button, styles.reject]} onPress={() => {onReject(item)}}>
                <Text style={styles.buttonText}>Rejeitar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>Não há notificações pendentes.</Text>
      )}
      ListFooterComponent={() =>
        (buttonDisplay) ? (<Pressable style={styles.loadMore} title="Carregar mais" onPress={onLoadMore}><Text style={styles.buttonText}>Carregar mais</Text></Pressable>) : null
  }
    />
  )
}

const styles = StyleSheet.create({
  card: {
  backgroundColor: '#1F2937',
  padding: 20,
  marginVertical: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  width: 330,
  borderRadius: 15,
  elevation: 5,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15
  },
  cardContainer: {
    width: '70%',
  },
  nova: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userPicture: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  name: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tempo: {
    color: '#ccc',
    fontSize: 12,
    position: 'absolute',
    right: 20,
    top: 5
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15
  },
  accept: {
    backgroundColor: '#00C49F',
  },
  reject: {
    backgroundColor: 'red'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  emptyText: {
    color: '#FFF'
  },
  loadMore: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal: 50
  },
})

export default RequestsList