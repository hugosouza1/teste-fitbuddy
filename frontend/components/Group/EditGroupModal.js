import {
  Modal, View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function EditGroupModal({
  visible,
  onClose,
  editState = {},
  selectedFriend,
  setSelectedFriend,
  friends = [],
  loadingFriends = false,
  onInviteMember,
  onRemoveMember,
  onSave,
  onOpenFriendPicker,


  setEditStartDateFormatted,
  setEditFinishDateFormatted,
  ICONS = ["users","running","fire","trophy","heartbeat","leaf","star","dumbbell"],
  styles = null
}) {
  const s = styles || internalStyles;

  const {
    editName = '', setEditName = () => {},
    editIcon = 'users', setEditIcon = () => {},
    editReward = '', setEditReward = () => {},
    editStartDate = '', setEditStartDateRaw = () => {},
    editFinishDate = '', setEditFinishDateRaw = () => {},
    editMembers = [], setEditMembers = () => {},
    newMemberEmail = '', setNewMemberEmail = () => {}
  } = editState;

  const handleInvite = async () => {
    if (!selectedFriend) return;

    try {
      const ok = await onInviteMember?.(selectedFriend.email);

      if (ok !== false) {
        setEditMembers(prev => [...prev, selectedFriend]);
        setSelectedFriend(null);
      }

    } catch (err) {
      console.error('Invite error', err);
      Alert.alert('Erro', 'Falha ao convidar membro');
    }
  };
  

  const handleRemove = async (email) => {
    try {
      const ok = await onRemoveMember?.(email);
      if (!ok) {
        setEditMembers(prev => prev.filter(m => m.email !== email));
      }
    } catch (err) {
      console.error('Remove member', err);
      Alert.alert('Erro', 'Falha ao remover membro');
    }
  };

  const openFriendPicker = () => { onOpenFriendPicker?.(); };

  return (
    <Modal visible={!!visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={internalStyles.modalOverlay}>
        <View style={internalStyles.modalBox}>
          <ScrollView>
            <Text style={internalStyles.modalTitle}>Grupo</Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>Nome do grupo</Text>
              <Text style={[internalStyles.modalInput, { paddingVertical: 12 }]}>{editName || ''}</Text>
            </View>

            <TextInput
              style={internalStyles.modalInput}
              placeholder="Data início (dd/mm/aaaa)"
              value={editStartDate}
              onChangeText={setEditStartDateFormatted || setEditStartDateRaw}
              keyboardType="numeric"
            />

            <TextInput
              style={internalStyles.modalInput}
              placeholder="Data fim (dd/mm/aaaa)"
              value={editFinishDate}
              onChangeText={setEditFinishDateFormatted || setEditFinishDateRaw}
              keyboardType="numeric"
            />

            <TextInput
              style={internalStyles.modalInput}
              placeholder="Recompensa"
              value={editReward}
              onChangeText={setEditReward}
            />

            <Text style={internalStyles.modalSubtitle}>Ícone</Text>
            <View style={internalStyles.iconRow}>
              {ICONS.map(icon => (
                <TouchableOpacity key={icon} style={[s.iconButton, editIcon === icon && s.iconSelected]} onPress={() => setEditIcon(icon)}>
                  <FontAwesome5 name={icon} size={24} color={editIcon === icon ? "#FFF" : "#AAA"} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={internalStyles.modalSubtitle}>Membros</Text>

            {Array.isArray(editMembers) && editMembers.length === 0 && (
              <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Nenhum membro</Text>
            )}

            {editMembers.map(m => (
              <View key={m.email} style={internalStyles.memberRow}>
                <View style={internalStyles.nameBox}><Text style={internalStyles.memberName}>{m.name || m.email}</Text></View>
                <TouchableOpacity onPress={() => handleRemove(m.email)}><FontAwesome name="trash" size={20} color="red" /></TouchableOpacity>
              </View>
            ))}

            <View style={internalStyles.addMemberRow}>
              <TouchableOpacity style={[internalStyles.nameBox, internalStyles.friendPickerButton]} onPress={openFriendPicker} activeOpacity={0.8}>
                <Text style={[internalStyles.memberInput, selectedFriend ? internalStyles.selectedFriendText : { color: '#666' }]}>
                  {selectedFriend ? selectedFriend.name : 'Adicionar membro'}

                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleInvite} style={[internalStyles.plusButton, !selectedFriend && { opacity: 0.45 }]}>
                <FontAwesome name="plus" size={24} color="#00C49F" />
              </TouchableOpacity>
            </View>

          </ScrollView>
          <View style={internalStyles.modalButtonsContainer}>
            <TouchableOpacity onPress={onClose} style={internalStyles.modalButton}><Text style={internalStyles.cancelText}>Sair</Text></TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={internalStyles.modalButton}><Text style={internalStyles.saveText}>Salvar</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const internalStyles = {
  modalOverlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.6)", 
    paddingHorizontal: 16, 
    paddingVertical: 20 
  },
  
  modalBox: { 
    width: "90%",
    height: "95%",
    alignSelf: "center",
    backgroundColor: "#1F2937", 
    borderRadius: 20, 
    padding: 20 
  },
  
  modalTitle: { 
    color: "#FFF", 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15 
  },
  
  modalInput: { 
    backgroundColor: "#374151", 
    color: "#FFF", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  
  modalSubtitle: { 
    color: "#FFF", 
    marginBottom: 10, 
    fontSize: 16, 
    fontWeight: "600" 
  },
  
  iconRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    marginBottom: 20 
  },
  
  iconButton: { 
    backgroundColor: "#2D3748", 
    padding: 12, 
    borderRadius: 10, 
    margin: 5 
  },
  
  iconSelected: { 
    backgroundColor: "#6C5CE7" 
  },
  
  modalButtonsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingTop: 15
  },

  modalButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 3
  },
  
  cancelText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  
  saveText: { color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  

  memberRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 10, 
    paddingHorizontal: 5 
  },
  
  nameBox: { 
    flex: 1, 
    backgroundColor: "#f2f2f2", 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    marginRight: 10 
  },
  
  addMemberRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 10, 
    paddingHorizontal: 5, 
    marginTop: 10 
  },
  
  memberInput: { 
    color: "#333", 
    fontSize: 16, 
    paddingVertical: 2
  },
  
  memberName: { 
    fontSize: 16, 
    color: "#333" 
  },
  
  friendPickerButton: { 
    backgroundColor: '#f2f2f2', 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    flex: 1, 
    justifyContent: 'center' 
  },
  
  plusButton: { 
    marginLeft: 8, 
    padding: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  selectedFriendText: { 
    color: '#111', 
    fontWeight: '600'
  }
};
