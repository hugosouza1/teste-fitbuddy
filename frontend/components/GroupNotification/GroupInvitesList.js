import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, Platform, View, Alert } from 'react-native'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { acceptGroupInvite, rejectGroupInvite } from '../../services/group/groupInviteService';
import { FontAwesome5 } from '@expo/vector-icons';

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

const GroupInvitesList = ({ invites, buttonDisplay, onLoadMore, setInvites }) => {

  const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

  const onAccept = async (group) => {
    const success = await acceptGroupInvite(BACKEND_URL, group.id)
  
    if(success) {
      setInvites(prev =>
        prev.filter(item => item.id !== group.id)
      )
    }
  }

  const onReject = async (group) => {  
    const success = await rejectGroupInvite(BACKEND_URL, group.id)

    if(success) {
      setInvites(prev =>
        prev.filter(item => item.id !== group.id)
      )
    }
  }

  return (
    <FlatList
      data={invites}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{
        alignItems: 'center',
      }}
      renderItem={({ item }) => (
        <View style={[styles.card, item.nova_solicitacao && styles.nova]}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name={item.icone || 'users'} size={32} color="#00C49F" />
          </View>
          <Text style={styles.tempo}>{dayjs(item.data).fromNow()}</Text>
          <View style={styles.cardContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.name}>{item.nome}</Text>
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
        <Text style={styles.emptyText}>Não há convites de grupos pendentes.</Text>
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center'
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

export default GroupInvitesList
