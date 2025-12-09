import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as groupsService from '../../services/group/groupService';
import { parseToISO as parseToISOUtil } from '../../utils/date';
import { Alert } from 'react-native';

export default function useCreateGroup(fetchGroupsCallback = null) {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('users');
  const [reward, setReward] = useState('');
  const [startDate, setStartDate] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [creating, setCreating] = useState(false);

  // máscara dd/mm/yyyy enquanto digita
  const formatDateInput = useCallback((text) => {
    let cleaned = (text || '').replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    if (cleaned.length >= 5) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
    else if (cleaned.length >= 3) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}`;
    else return cleaned;
  }, []);

  const setStartDateFormatted = useCallback((text) => {
    setStartDate(formatDateInput(text));
  }, [formatDateInput]);

  const setFinishDateFormatted = useCallback((text) => {
    setFinishDate(formatDateInput(text));
  }, [formatDateInput]);

  const resetCreateState = useCallback(() => {
    setNewGroupName('');
    setSelectedIcon('users');
    setReward('');
    setStartDate('');
    setFinishDate('');
  }, []);

  const createGroup = useCallback(async () => {
    if (creating) return false;
    setCreating(true);
    try {
      const userEmail = await AsyncStorage.getItem('email');
      if (!userEmail) throw new Error('Usuário não encontrado');

      if (!newGroupName.trim() || !startDate.trim() || !finishDate.trim() || !reward.trim()) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return false;
      }

      const payload = {
        nome: newGroupName.trim(),
        icone: selectedIcon,
        recompensa: reward.trim(),
        data_inicio: parseToISOUtil(startDate),
        data_termino: parseToISOUtil(finishDate),
        email: userEmail
      };

      await groupsService.createGroup(payload);

      if (typeof fetchGroupsCallback === 'function') {
        await fetchGroupsCallback();
      }

      return true;
    } catch (err) {
      console.error('useCreateGroup.createGroup', err);
      Alert.alert('Erro', 'Falha ao criar grupo');
      return false;
    } finally {
      setCreating(false);
    }
  }, [newGroupName, selectedIcon, reward, startDate, finishDate, creating, fetchGroupsCallback]);

  return {
    newGroupName, setNewGroupName,
    selectedIcon, setSelectedIcon,
    reward, setReward,
    startDate, setStartDate,           
    finishDate, setFinishDate,
    
    setStartDateFormatted,
    setFinishDateFormatted,
    creating, createGroup, resetCreateState,
    formatDateInput
  };
}
