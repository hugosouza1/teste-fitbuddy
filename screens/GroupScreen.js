import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, ActivityIndicator,
  Alert, Modal, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CreationCard from '../components/Group/CreationCard';
import GroupProgressCard from '../components/Group/GroupProgressCard';

const ICONS = ["users", "running", "fire", "trophy", "heartbeat", "leaf", "star", "dumbbell"];

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("users");
  const [editReward, setEditReward] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editFinishDate, setEditFinishDate] = useState("");
  const [editMembers, setEditMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("users");
  const [reward, setReward] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [creating, setCreating] = useState(false);

  const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// Reutilizável: busca grupos do backend pelo email do usuário
const fetchGroupsFromServer = async () => {
  setLoading(true);
  try {
    const userEmail = await AsyncStorage.getItem('email');
    if (!userEmail) throw new Error('Usuário não encontrado');

    const res = await fetch(`${BACKEND_URL}/api/groups/getGrupos?email=${encodeURIComponent(userEmail)}`);
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const data = await res.json();

    const raw = (data.grupos ?? data.rows ?? data);
    const grupos = (raw || []).map(g => ({
      id: g.id,
      name: g.nome,
      icon: g.icone,
      reward: g.recompensa,
      startDate: g.data_inicio,
      finishDate: g.data_termino,
      membersDesc: [],
    }));

    setGroups(grupos);

    return grupos;
  } catch (err) {
    console.error('Erro ao carregar grupos:', err);
    Alert.alert('Erro', 'Falha ao carregar grupos.');
    return [];
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchGroupsFromServer();
}, []);

useEffect(() => {
  if (selectedGroup) {
    // Ao abrir modal: recarrega o grupo do servidor (nome/ícone/datas) e carrega membros
    const loadGroupAndMembers = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('email');

        // Recarrega grupos do servidor para garantir dados mais recentes
        const allGroups = await fetchGroupsFromServer();
        const fresh = (allGroups || []).find(g => g.id === selectedGroup.id) || selectedGroup;

        // Preenche campos de edição a partir do servidor (nome vindo do banco)
        setEditName(fresh.name || "");
        setEditIcon(fresh.icon || "users");
        setEditReward(fresh.reward || "");
        setEditStartDate(formatDateFromISO(fresh.startDate));
        setEditFinishDate(formatDateFromISO(fresh.finishDate));

        // Carrega membros
        const res = await fetch(`${BACKEND_URL}/api/groups/getMembers/${selectedGroup.id}`);
        if (res.ok) {
          const membersData = await res.json();
          const members = Array.isArray(membersData) ? membersData : (membersData.members || []);
          setEditMembers(members.map(m => ({ name: m.nome || m.name || '', email: m.email })));
        } else {
          setEditMembers([]);
        }

        setNewMemberEmail("");
      } catch (err) {
        console.error('Erro ao carregar grupo/membros:', err);
        setEditMembers([]);
      }
    };
    loadGroupAndMembers();
  } else {
    fetchGroupsFromServer();
    setEditName("");
    setEditIcon("users");
    setEditReward("");
    setEditStartDate("");
    setEditFinishDate("");
    setEditMembers([]);
    setNewMemberEmail("");
  }
}, [selectedGroup]);


  const formatDateInput = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    if (cleaned.length >= 5) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
    else if (cleaned.length >= 3) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}`;
    else return cleaned;
  };

  // Converter ISO string para dd/mm/aaaa
  const formatDateFromISO = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return isoString;
    }
  };

  const handleCreateGroup = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const userEmail = await AsyncStorage.getItem('email');
      if (!userEmail) throw new Error("Usuário não encontrado");

      if (!newGroupName.trim() || !startDate.trim() || !finishDate.trim() || !reward.trim()) {
        return Alert.alert("Erro", "Preencha todos os campos");
      }

      const parseToISO = (str) => {
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`).toISOString();
      };

      const newGroup = {
        nome: newGroupName.trim(),
        icone: selectedIcon,
        recompensa: reward.trim(),
        data_inicio: parseToISO(startDate),
        data_termino: parseToISO(finishDate),
        email: userEmail
      };

      const res = await fetch(`${BACKEND_URL}/api/groups/createGrupo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Erro ${res.status}: ${text}`);
      }

      const data = await res.json();
      
      // Recarrega a lista do servidor para garantir que o novo grupo venha com os dados do banco
      await fetchGroupsFromServer();

      setNewGroupName("");
      setSelectedIcon("users");
      setReward("");
      setStartDate("");
      setFinishDate("");
      setIsCreateModalVisible(false);

    } catch (err) {
      console.error("Erro ao criar grupo:", err);
      Alert.alert("Erro", "Falha ao criar grupo");
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async () => {
    const email = (newMemberEmail || "").trim();
    if (!email) return Alert.alert("Erro", "Digite o email do membro");

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/addMember`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGroup.id, email })
      });

      if (!res.ok) throw new Error('Falha ao adicionar membro');

      setEditMembers(prev => [...prev, { email }]);
      setNewMemberEmail("");

    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao adicionar membro");
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/groups/removeMember`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGroup.id, email: memberEmail })
      });

      if (!res.ok) throw new Error('Falha ao remover membro');
      setEditMembers(prev => prev.filter(m => m.email !== memberEmail));

    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao remover membro");
    }
  };

  const handleSaveAndClose = async () => {
    if (!editStartDate.trim() || !editFinishDate.trim()) return Alert.alert("Erro", "Preencha datas de início e fim");

    try {
      // Converter dd/mm/aaaa para ISO
      const parseToISO = (str) => {
        if (!str) return '';
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`).toISOString();
      };

      // Não enviamos o nome aqui (nome vem do banco). Enviamos ícone/recompensa/datas
      const payload = {
        icone: editIcon,
        recompensa: editReward,
        data_inicio: parseToISO(editStartDate),
        data_termino: parseToISO(editFinishDate)
      };

      const res = await fetch(`${BACKEND_URL}/api/groups/updateGroup/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `Erro ${res.status}`;
        throw new Error(msg);
      }

      const updated = (data && data.group) ? data.group : data;

      const updatedGroup = {
        id: updated.id,
        name: updated.nome || editName,
        icon: updated.icone || editIcon,
        reward: updated.recompensa || editReward,
        startDate: updated.data_inicio || (parseToISO(editStartDate)),
        finishDate: updated.data_termino || (parseToISO(editFinishDate)),
        membersDesc: editMembers || []
      };

      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      setSelectedGroup(null);
      Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');

    } catch (err) {
      console.error(err);
      Alert.alert("Erro", `Falha ao atualizar grupo: ${err.message || ''}`);
    }
  };

  const filteredGroups = groups.filter(g => (g.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Meus Grupos</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <CreationCard onNavigate={() => setIsCreateModalVisible(true)} />

        <View style={styles.searchBarContainer}>
          <FontAwesome name="search" size={16} color={"#9CA3AF"} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupo"
            placeholderTextColor={"#9CA3AF"}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={"#00C49F"} />
        ) : (
          filteredGroups.map(g => (
            <GroupProgressCard key={g.id} group={g} onPress={() => setSelectedGroup(g)} />
          ))
        )}
      </ScrollView>

            
            {/* Modal de edição */}
      <Modal visible={!!selectedGroup} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Grupo</Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>Nome do grupo</Text>
              <Text style={[styles.modalInput, { paddingVertical: 12 }]}>{editName || ''}</Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Data início (dd/mm/aaaa)"
              value={editStartDate}
              onChangeText={(text) => setEditStartDate(formatDateInput(text))}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Data fim (dd/mm/aaaa)"
              value={editFinishDate}
              onChangeText={(text) => setEditFinishDate(formatDateInput(text))}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Recompensa"
              value={editReward}
              onChangeText={setEditReward}
            />

            <Text style={styles.modalSubtitle}>Ícone</Text>
            <View style={styles.iconRow}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconButton, editIcon === icon && styles.iconSelected]}
                  onPress={() => setEditIcon(icon)}
                >
                  <FontAwesome5 name={icon} size={24} color={editIcon === icon ? "#FFF" : "#AAA"} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubtitle}>Membros</Text>

            {editMembers.map((m) => (
              <View key={m.email} style={styles.memberRow}>
                <View style={styles.nameBox}>
                  <Text style={styles.memberName}>{m.name || m.email}</Text>
                </View>

                <TouchableOpacity onPress={() => handleRemoveMember(m.email)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addMemberRow}>
              <View style={styles.nameBox}>
                <TextInput
                  style={styles.memberInput}
                  placeholder="Email do membro"
                  placeholderTextColor="#666"
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                />
              </View>

              <TouchableOpacity onPress={handleAddMember}>
                <FontAwesome name="plus" size={24} color="#00C49F" />
              </TouchableOpacity>
            </View>


            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAndClose}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* Modal de criação */}
      <Modal visible={isCreateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Criar Novo Grupo</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome do grupo"
              placeholderTextColor="#888"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Data de início (dd/mm/aaaa)"
              placeholderTextColor="#888"
              value={startDate}
              onChangeText={(text) => setStartDate(formatDateInput(text))}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Data de fim (dd/mm/aaaa)"
              placeholderTextColor="#888"
              value={finishDate}
              onChangeText={(text) => setFinishDate(formatDateInput(text))}
              keyboardType="numeric"
            />

            <Text style={styles.modalSubtitle}>Escolher ícone</Text>
            <View style={styles.iconRow}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconButton, selectedIcon === icon && styles.iconSelected]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <FontAwesome5 name={icon} size={24} color={selectedIcon === icon ? "#FFF" : "#AAA"} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Recompensa"
              placeholderTextColor="#888"
              value={reward}
              onChangeText={setReward}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreateModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateGroup} disabled={creating}>
                <Text style={styles.saveText}>{creating ? "Criando..." : "Criar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingHorizontal: 15,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#FFF",
        marginVertical: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#1F2937",
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        color: "#FFF",
        fontSize: 16,
        marginLeft: 10,
    },

    modalOverlay: {
      flex: 1,                       // ocupa toda a tela
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 16,         // garante espaço lateral no celular
      paddingVertical: 20
    },

    modalBox: {
        width: "85%",
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
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    cancelButton: {
        backgroundColor: "#888",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    cancelText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold"
    },
    saveButton: {
        backgroundColor: "#6C5CE7",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    saveText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold"
    },

    detailsBox: {
      width: "100%",                 // ocupar a largura disponível dentro do overlay
      maxWidth: 520,                 // evitar ficar gigante em tablets; opcional
      backgroundColor: "#1F2937",
      borderRadius: 20,
      padding: 20,
      maxHeight: '80%',              // limita a altura para permitir scroll
      alignSelf: 'center'
    },

    detailsHeader: {
        alignItems: "center",
        marginBottom: 20
    },
    detailsTitle: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 10
    },
    detailCard: {
        backgroundColor: "#2D3748",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
    },
    detailCardRow: {
        backgroundColor: "#2D3748",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    detailColumn: {
        width: "48%"
    },
    label: {
        color: "#9CA3AF",
        fontSize: 14
    },
    value: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 5
    },

    membersListScroll: {
      maxHeight: 180,       // <-- impede ultrapassar outros cards
      marginTop: 10,
      paddingRight: 6
    },

    memberBubble: {
        backgroundColor: "#6C5CE7",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 3,
        marginBottom: 8
    },
    memberText: {
        color: "#FFF",
        fontWeight: "bold"
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: "#6C5CE7",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center"
    },
    closeText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold"
    },
    membersListColumn: {
        marginTop: 10,
    },
    memberRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 5,
    },

    nameBox: {
      flex: 1,
      backgroundColor: "#f2f2f2",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginRight: 10, // espaço antes da lixeira
    },
    
addMemberRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 5,
  marginTop: 10,
},

memberInput: {
  color: "#333",
  fontSize: 16,
  paddingVertical: 4,
},


    memberName: {
      fontSize: 16,
      color: "#333",
    },

});
