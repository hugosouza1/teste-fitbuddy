import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, View, Alert, Image, ActivityIndicator, Platform, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import GymSelector from '../components/Profile/GymSelector';
import GymRegister from '../components/Profile/GymRegister';

import { toBrazilDateString, toIsoDateString } from '../utils/date';

import useProfile  from '../hooks/profile/profile';

function ProfileScreen({ onNavigate }) {
  const {
    email, setEmail,
    name, setName,
    birthDate, setBirthDate,
    showDatePicker, setShowDatePicker,
    focus, setFocus,
    gym, setGym, gymSelected, setGymSelected,
    bio, setBio,
    experienceLevel, setExperienceLevel,
    availableTimes, setAvailableTimes,
    newTime, setNewTime,
    profilePic,
    addTime, removeTime,
    loading, fetching,
    saveProfile,
    clearStorageAndLogout,
    pickImage,
    deleteUserAccount,

    isGymModalVisible, setIsGymModalVisible,
    isGymRegisterModalVisible, setIsGymRegisterModalVisible

  } = useProfile();

  const EXPERIENCE_LEVELS = ['Iniciante', 'Regular', 'Avançado'];

  const [localLoading, setLocalLoading] = useState(false); 

  const openDatePicker = () => setShowDatePicker(true);
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  const handleAddTime = () => {
    const ok = addTime(newTime);
    if (ok) setNewTime('');
  };

  const handleRemoveTime = (timeToRemove) => removeTime(timeToRemove);

  const handleGymSelect = (g) => { setGym(g); setGymSelected(true); };

  const handleSave = async () => {
    if (!name || !birthDate || !focus) { Alert.alert('Atenção', 'Nome, Data de Nascimento e Foco são obrigatórios.'); return; }
    setLocalLoading(true);
    try {
      await saveProfile(email);

    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      Alert.alert('Erro', 'Falha ao salvar o perfil.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente fazer logout?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await clearStorageAndLogout(onNavigate); } }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Apagar conta', 'Esta ação é irreversível. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => {
        const deleted = await deleteUserAccount();
        if(deleted) {
          Alert.alert('Conta apagada', 'Sua conta foi removida com sucesso.');
          await clearStorageAndLogout(onNavigate);
        } else {
          Alert.alert('Erro', 'Não foi possível deletar sua conta. Tente novamente mais tarde.')
        }
      } }
    ]);
  };

  if (!email) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ marginBottom: 12 }}>Email do usuário não fornecido.</Text>
      </View>
    );
  }

  if (fetching) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator size="large" />
        <Text>Carregando perfil...</Text>
      </View>
    );


}

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>

          {/* Foto */}
          <View style={styles.profilePicContainer}>
            <Image source={{ uri: profilePic }} style={styles.profilePic} />
            <Pressable style={styles.editPicButton} onPress={pickImage}>
                <FontAwesome name="camera" size={16} color="#FFF" />
            </Pressable>
          </View>

          <Text style={styles.title}>Editar Perfil</Text>

          {/* Informações Pessoais */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          </View>
          <View style={styles.inputGroup}>
            <FontAwesome name="user" size={20} color="#00C49F" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Depois vai puxar do banco" placeholderTextColor="#888" value={name} onChangeText={setName} />
          </View>

          {/* Data de Nascimento (substitui input de idade) */}
          <View style={styles.inputGroup}>
            <FontAwesome name="calendar" size={20} color="#00C49F" style={styles.icon} />
            <TouchableOpacity style={{ flex: 1 }} onPress={openDatePicker}>
              <Text style={[styles.input, { paddingVertical: 12 }]}>{birthDate ? toBrazilDateString(birthDate) : 'Data de nascimento'}</Text>
            </TouchableOpacity>
            <FontAwesome name="chevron-right" size={14} color="#FFF" />
          </View>

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date(1990, 0, 1)}
              mode="date"
              maximumDate={new Date()} // não permite datas futuras
              display="default"
              onChange={onChangeDate}
            />
          )}

          <View style={styles.inputGroup}>
            <FontAwesome name="fire" size={20} color="#00C49F" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Foco (Ex: Ganho de Massa)" placeholderTextColor="#888" value={focus} onChangeText={setFocus} />
          </View>

          {/* Seleção de acad */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Academia</Text>
          </View>

          {/* Abrir a seleção de acad */}
          <TouchableOpacity
            style={styles.inputGroup}
            onPress={() => setIsGymModalVisible(true)}
          >
            <FontAwesome name="home" size={20} color="#00C49F" style={styles.icon} />
            {!gymSelected && <Text style={styles.inputGymText}>Selecione a acadedemia</Text>}
            {gymSelected &&
              <View>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.inputGymText}>{gym.nome}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.inputGymSubtext}>{gym.logradouro}, {gym.cidade}</Text>
              </View>
            }
            <FontAwesome name="chevron-right" size={14} color="#FFF" />
          </TouchableOpacity>

          {/* Nível de Experiência */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nível de Experiência</Text>
          </View>
          <View style={styles.levelSelectorContainer}>
            {EXPERIENCE_LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  experienceLevel === level && styles.levelButtonSelected
                ]}
                onPress={() => setExperienceLevel(level)}
              >
                <Text style={[styles.levelText, experienceLevel === level && styles.levelTextSelected]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bio */}
          <View style={styles.inputGroupBio}>
            <TextInput
              style={styles.bioInput}
              placeholder="Fale um pouco sobre você e seus objetivos."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          {/* Horários Disponíveis */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
          </View>

          <Text style={styles.label}>Adicione seu horário.</Text>

          {/* Adicionar Horário */}
          <View style={styles.addTimeContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="Ex: 18:30"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
              value={newTime}
              onChangeText={setNewTime}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timesListContainer}>
            {availableTimes.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum horário adicionado.</Text>
            ) : (
                availableTimes.map(time => (
                    <View key={time} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{time}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTime(time)} style={styles.removeTimeButton}>
                        <FontAwesome name="close" size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                ))
            )}
          </View>
          {/* //////////////////// */}

                    {/* Ações: Apagar conta + Logout */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBox, styles.deleteBox]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBoxTitle}>Apagar Conta</Text>
              <Text style={styles.actionBoxText}>Remover todos os dados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBox, styles.logoutBox]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBoxTitle}>Logout</Text>
              <Text style={styles.actionBoxText}>Sair da sua sessão</Text>
            </TouchableOpacity>
            </View>
          {/* /////////////////////////// */}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
          </TouchableOpacity>

        </View>
      </ScrollView>

      <GymSelector
        isVisible={isGymModalVisible}
        onClose={() => setIsGymModalVisible(false)}
        onSelectGym={handleGymSelect}
        openGymRegister={() => setIsGymRegisterModalVisible(true)}
      />
      <GymRegister
        isVisible={isGymRegisterModalVisible}
        onClose={() => setIsGymRegisterModalVisible(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', 
    paddingBottom: 40,
    paddingTop: 10
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#00C49F',
    fontSize: 18,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#1F2937', 
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    marginBottom: 50
  },
  profilePicContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6C5CE7',
  },
  editPicButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#00C49F',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
  },
  sectionHeader: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    paddingBottom: 5,
    marginBottom: 15,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  label: {
    width: '100%',
    color: '#FFF',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563', 
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    width: '100%',
  },
  inputGymText: {
    fontSize: 16,
    color: '#FFF',
    marginRight: 10,
    maxWidth: '80%',
  },
  inputGymSubtext: {
    color: '#eee',
    fontSize: 12,
    maxWidth: '80%',
  },
  inputGroupBio: {
    backgroundColor: '#4B5563', 
    borderRadius: 8,
    marginBottom: 20,
    padding: 15,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFF',
  },
  bioInput: {
    minHeight: 80,
    fontSize: 16,
    color: '#FFF',
    textAlignVertical: 'top',
  },
  levelSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
  },
  levelButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#4B5563',
    alignItems: 'center',
  },
  levelButtonSelected: {
    backgroundColor: '#6C5CE7',
    borderWidth: 2,
    borderColor: '#00C49F',
  },
  levelText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
  levelTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addTimeContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 15,
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  timeInput: {
      backgroundColor: '#4B5563',
      borderRadius: 8,
      height: 45,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#FFF',
      width: '60%',
  },
  addButton: {
      backgroundColor: '#00C49F',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      width: '35%',
      alignItems: 'center',
  },
  addButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
  },

  timesListContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
      minHeight: 40,
      marginBottom: 30,
      padding: 5,
      borderRadius: 8,
      backgroundColor: '#374151',
      alignItems: 'flex-start',
  },
  timeChip: {
      flexDirection: 'row',
      backgroundColor: '#6C5CE7',
      borderRadius: 15,
      paddingVertical: 5,
      paddingLeft: 10,
      paddingRight: 5,
      margin: 4,
      alignItems: 'center',
  },
  timeChipText: {
      color: '#FFF',
      fontSize: 14,
      marginRight: 5,
      fontWeight: '600',
  },
  removeTimeButton: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 10,
      padding: 3,
  },
  emptyText: {
      color: '#888',
      fontSize: 14,
      padding: 10,
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
    actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 6, // cria o "não colado" entre as duas caixas
    backgroundColor: '#0F1724', // leve variação do fundo do card
    minHeight: 76,
  },
  actionBoxTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  actionBoxText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  deleteBox: {
    borderColor: '#EF4444',
    // opcional: sombra/gradiente, mas mantenho simples
  },
  logoutBox: {
    borderColor: '#00C49F',
  },

});



export default ProfileScreen;