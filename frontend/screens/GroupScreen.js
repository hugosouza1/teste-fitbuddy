import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import CreationCard from '../components/Group/CreationCard';
import GroupProgressCard from '../components/Group/GroupProgressCard';
import EditGroupModal from '../components/Group/EditGroupModal';
import FriendPickerModal from '../components/Group/FriendPickerModal';
import CreateGroupModal from '../components/Group/CreateGroupModal';

import useGroups from '../hooks/group/useGroups';
import useGroupEditor from '../hooks/group/useGroupEditor';
import useCreateGroup from '../hooks/group/useCreateGroup';

const ICONS = ["users","running","fire","trophy","heartbeat","leaf","star","dumbbell"];

export default function GroupsScreen() {
  const { groups, loading: loadingGroups, fetchGroups } = useGroups();
  const editor = useGroupEditor();
  const creator = useCreateGroup(fetchGroups);

  const {
    selectedGroup, selectGroup, clearSelection,
    editName, setEditName,
    editIcon, setEditIcon,
    editReward, setEditReward,
    editStartDate, setEditStartDate, setEditStartDateFormatted,
    editFinishDate, setEditFinishDate, setEditFinishDateFormatted,
    editMembers, setEditMembers,
    selectedFriend, setSelectedFriend,
    friends, loadFriends, loadingFriends,
    inviteMember, removeMember, saveChanges,
    loadingGroup, saving
  } = editor;

  const {
    newGroupName, setNewGroupName,
    selectedIcon, setSelectedIcon,
    reward, setReward,
    startDate, setStartDateFormatted,
    finishDate, setFinishDateFormatted,
    creating, createGroup, resetCreateState
  } = creator;

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isFriendPickerVisible, setIsFriendPickerVisible] = useState(false);

  const filtered = useMemo(() => (groups || []).filter(g => (g.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())), [groups, searchTerm]);

  const openFriendPicker = async () => {
    await loadFriends();
    setIsFriendPickerVisible(true);
  };

  const handleInviteFromEditor = async () => {
    const ok = await inviteMember(selectedFriend?.email);
    if (ok) {
      setIsFriendPickerVisible(false);
      setSelectedFriend(null);
    }
  };

  const handleRemoveMember = async (email) => {
    const confirmed = await new Promise(res => {
      Alert.alert('Confirmar', 'Remover membro?', [
        { text: 'Cancelar', style: 'cancel', onPress: () => res(false) },
        { text: 'Remover', style: 'destructive', onPress: () => res(true) }
      ]);
    });
    if (!confirmed) return;
    await removeMember(email);
  };

  const handleSaveEditor = async () => {
    const updated = await saveChanges();
    if (updated) await fetchGroups();
  };

  const handleCreate = async () => {
    const ok = await createGroup();
    if (ok) {
      setIsCreateModalVisible(false);
      resetCreateState();
      await fetchGroups();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Meus Grupos</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <CreationCard onNavigate={() => setIsCreateModalVisible(true)} />
        <View style={styles.searchBarContainer}>
          <FontAwesome name="search" size={16} color={"#9CA3AF"} />
          <TextInput style={styles.searchInput} placeholder="Buscar grupo" placeholderTextColor={"#9CA3AF"} value={searchTerm} onChangeText={setSearchTerm} />
        </View>

        {loadingGroups ? <ActivityIndicator size="large" color={"#00C49F"} /> :
          filtered.map(g => <GroupProgressCard key={g.id} group={g} onPress={() => selectGroup(g)} />)
        }
      </ScrollView>

      <EditGroupModal
        visible={!!selectedGroup}
        onClose={() => clearSelection()}
        editState={{
          editName, setEditName,
          editIcon, setEditIcon,
          editReward, setEditReward,
          editStartDate, setEditStartDate,
          editFinishDate, setEditFinishDate,
          editMembers, setEditMembers
        }}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
        friends={friends}
        loadingFriends={loadingFriends}
        onInviteMember={handleInviteFromEditor}
        onRemoveMember={handleRemoveMember}
        onSave={handleSaveEditor}
        onOpenFriendPicker={openFriendPicker}
        setEditStartDateFormatted={setEditStartDateFormatted}
        setEditFinishDateFormatted={setEditFinishDateFormatted}
        ICONS={ICONS}
        styles={styles}
      />

      <FriendPickerModal
        visible={isFriendPickerVisible}
        onClose={() => { setIsFriendPickerVisible(false); }}
        onConfirm={(friend) => { setSelectedFriend(friend); setIsFriendPickerVisible(false); }}
        friends={friends}
        loadingFriends={loadingFriends}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
      />

      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => { setIsCreateModalVisible(false); resetCreateState(); }}
        newGroupState={{
          newGroupName, setNewGroupName,
          selectedIcon, setSelectedIcon,
          reward, setReward,
          startDate, setStartDate: setStartDateFormatted,
          finishDate, setFinishDate: setFinishDateFormatted
        }}
        creating={creating}
        onCreate={handleCreate}
        ICONS={ICONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#111827", 
    paddingBottom: 50,
    paddingHorizontal: 15,
  },
  
  mainTitle: { fontSize: 24, 
    fontWeight: 'bold', 
    color: "#FFF", 
    marginVertical: 20 
  },
  
  scrollContent: { 
    paddingBottom: 40 
  },
  
  searchBarContainer: { flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: "#1F2937", 
    height: 50, 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    marginBottom: 20 
  },
  
  searchInput: { flex: 1, 
    color: "#FFF", 
    fontSize: 16, 
    marginLeft: 10 
  },
  
  modalOverlay: { flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.6)", 
    paddingHorizontal: 16, 
    paddingVertical: 20 
  },
  
  modalBox: { width: "85%", 
    backgroundColor: "#1F2937", 
    borderRadius: 20, 
    padding: 20 
  },
  
  modalTitle: { color: "#FFF", 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15 
  },
  
  modalInput: { backgroundColor: "#374151", 
    color: "#FFF", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  
  modalSubtitle: { color: "#FFF", 
    marginBottom: 10, 
    fontSize: 16, 
    fontWeight: "600" 
  },
  
  iconRow: { flexDirection: "row", 
    flexWrap: "wrap", 
    marginBottom: 20 
  },
  
  iconButton: { backgroundColor: "#2D3748", 
    padding: 12, 
    borderRadius: 10, 
    margin: 5 
  },
  
  iconSelected: { 
    backgroundColor: "#6C5CE7" 
  },
  
  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10 
  },
  
  cancelText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  
  saveText: { 
    color: "#FFF", 
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
    paddingVertical: 4 
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
});
