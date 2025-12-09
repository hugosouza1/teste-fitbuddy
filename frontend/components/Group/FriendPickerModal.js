import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';


export default function FriendPickerModal({
  visible,
  onClose = () => {},
  onConfirm = null,
  friends = [],
  loadingFriends = false,
  selectedFriend = null,
  setSelectedFriend = () => {},
  styles = null
}) {
  const s = styles || internalStyles;

  const renderItem = ({ item }) => {
    const isSelected = selectedFriend && selectedFriend.email === item.email;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFriend(item)}
        style={[s.friendRow, isSelected && s.friendRowSelected]}
      >
        <View>
          <Text style={[s.friendName, isSelected && s.friendNameSelected]}>
            {item.name || item.email}
          </Text>
          {item.email ? (
            <Text style={[s.friendEmail, isSelected && s.friendEmailSelected]}>{item.email}</Text>
          ) : null}
        </View>

        {isSelected && <Text style={s.check}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={!!visible} transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.box}>
          <Text style={s.title}>Selecionar amigo</Text>

          {loadingFriends ? (
            <View style={s.loadingArea}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={s.loadingText}>Carregando...</Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => (item.id ? String(item.id) : (item.email || item.name))}
              renderItem={renderItem}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={s.actions}>
            <TouchableOpacity
              style={s.cancelButton}
              onPress={() => {
                setSelectedFriend(null);
                onClose();
              }}
            >
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.confirmButton, !selectedFriend && { opacity: 0.6 }]}
              onPress={() => {
                if (!selectedFriend) return;
                if (typeof onConfirm === 'function') onConfirm(selectedFriend);
                onClose();
              }}
              disabled={!selectedFriend}
            >
              <Text style={s.confirmText}>{selectedFriend ? 'Selecionar' : 'Fechar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* --- estilos internos --- */
const internalStyles = {
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 40 : 20
  },
  box: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  loadingArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },
  loadingText: {
    color: '#fff',
    marginTop: 8
  },
  listContent: {
    paddingBottom: 8
  },
  friendRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  friendRowSelected: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    paddingHorizontal: 8
  },
  friendName: {
    color: '#ddd',
    fontWeight: '600'
  },
  friendNameSelected: {
    color: '#fff'
  },
  friendEmail: {
    color: '#9CA3AF',
    fontSize: 12
  },
  friendEmailSelected: {
    color: '#fff'
  },
  check: {
    color: '#fff',
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#888',
    borderRadius: 8
  },
  cancelText: {
    color: '#fff',
    fontWeight: '700'
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#6C5CE7',
    borderRadius: 8
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700'
  }
};
