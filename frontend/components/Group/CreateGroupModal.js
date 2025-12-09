import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function CreateGroupModal({
  visible,
  onClose,
  newGroupState = {},
  creating = false,
  onCreate = () => {},
  ICONS = ["users","running","fire","trophy","heartbeat","leaf","star","dumbbell"],
  styles = null
}) {
  const s = styles || internalStyles;
  const {
    newGroupName = '', setNewGroupName = () => {},
    selectedIcon = 'users', setSelectedIcon = () => {},
    reward = '', setReward = () => {},
    startDate = '', setStartDate = () => {},
    finishDate = '', setFinishDate = () => {}
  } = newGroupState;

  return (
    <Modal visible={!!visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
        <View style={s.modalBox}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={s.modalTitle}>Criar Novo Grupo</Text>

            <TextInput style={s.modalInput} placeholder="Nome do grupo" placeholderTextColor="#888"
              value={newGroupName} onChangeText={setNewGroupName} />

            <TextInput style={s.modalInput} placeholder="Data de início (dd/mm/aaaa)" placeholderTextColor="#888"
              value={startDate} onChangeText={setStartDate} keyboardType="numeric" />

            <TextInput style={s.modalInput} placeholder="Data de fim (dd/mm/aaaa)" placeholderTextColor="#888"
              value={finishDate} onChangeText={setFinishDate} keyboardType="numeric" />

            <Text style={s.modalSubtitle}>Escolher ícone</Text>
            <View style={s.iconRow}>
              {ICONS.map(icon => (
                <TouchableOpacity key={icon} style={[s.iconButton, selectedIcon === icon && s.iconSelected]} onPress={() => setSelectedIcon(icon)}>
                  <FontAwesome5 name={icon} size={24} color={selectedIcon === icon ? "#FFF" : "#AAA"} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={s.modalInput} placeholder="Recompensa" placeholderTextColor="#888"
              value={reward} onChangeText={setReward} />

            <View style={s.modalButtons}>
              <TouchableOpacity style={s.cancelButton} onPress={onClose}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.saveButton} onPress={onCreate} disabled={creating}>
                <Text style={s.saveText}>{creating ? "Criando..." : "Criar"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const internalStyles = {
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

  iconSelected: { backgroundColor: "#6C5CE7" 
    
  },

  modalButtons: { flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10 
  },

  cancelButton: { backgroundColor: "#888", 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },

  cancelText: { color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },

  saveButton: { backgroundColor: "#6C5CE7", 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },

  saveText: { color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold" }
};
