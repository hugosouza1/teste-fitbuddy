import { useState, useEffect, useCallback } from 'react';
import * as groupsService from '../../services/group/groupService';
import { formatDateFromISO, parseToISO } from '../../utils/date';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function useGroupEditor() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('users');
  const [editReward, setEditReward] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editFinishDate, setEditFinishDate] = useState('');

  const [editMembers, setEditMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const formatDateInput = useCallback((text) => {
    let cleaned = (text||'').replace(/\D/g,'');
    if (cleaned.length>8) cleaned = cleaned.slice(0,8);
    if (cleaned.length>=5) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
    if (cleaned.length>=3) return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}`;
    return cleaned;
  }, []);

  const setEditStartDateFormatted = useCallback((t)=> setEditStartDate(formatDateInput(t)), [formatDateInput]);
  const setEditFinishDateFormatted = useCallback((t)=> setEditFinishDate(formatDateInput(t)), [formatDateInput]);

  const resetEditState = useCallback(()=> {
    setEditName(''); setEditIcon('users'); setEditReward('');
    setEditStartDate(''); setEditFinishDate('');
    setEditMembers([]); setSelectedFriend(null);
  }, []);

  const selectGroup = useCallback((group)=> setSelectedGroup(group || null), []);

  useEffect(() => {
    if (!selectedGroup) { resetEditState(); return; }
    
    let active = true;
    (async ()=> {
      setLoadingGroup(true);
      try {
        setEditName(selectedGroup.name || selectedGroup.nome || '');
        setEditIcon(selectedGroup.icon || selectedGroup.icone || 'users');
        setEditReward(selectedGroup.reward || selectedGroup.recompensa || '');
        setEditStartDate(formatDateFromISO(selectedGroup.startDate || selectedGroup.data_inicio));
        setEditFinishDate(formatDateFromISO(selectedGroup.finishDate || selectedGroup.data_termino));
        if (selectedGroup.id) {
          const members = await groupsService.getMembers(selectedGroup.id);
          if (!active) return;
          setEditMembers(Array.isArray(members) ? members.map(m => ({ name: m.nome||m.name, email: m.email })) : []);
        }
      } catch(e){ console.error(e); Alert.alert('Erro','Falha ao carregar grupo'); }
      finally { if(active) setLoadingGroup(false); }

    })();
    return ()=> { active = false; };
  }, [selectedGroup, resetEditState]);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const userEmail = await AsyncStorage.getItem('email');
      const list = await groupsService.fetchFriends(userEmail);
      setFriends(Array.isArray(list) ? list.filter(f => !editMembers.some(m => m.email===f.email)) : []);
      return friends;
    } catch (e) { console.warn(e); setFriends([]); return []; }
    finally { setLoadingFriends(false); }
  }, [editMembers]);

  const inviteMember = useCallback(async (email) => {
    if (!selectedGroup?.id) return false;
    setInviting(true);
    try {
      const emailToAdd = email || selectedFriend?.email;
      if (!emailToAdd) { Alert.alert('Erro', 'Selecione um amigo'); return false; }
      await groupsService.inviteMember(selectedGroup.id, emailToAdd);

      setSelectedFriend(null);
      Alert.alert('Sucesso', 'Convite enviado!');
      return true;
    } catch (e) { console.error(e); Alert.alert('Erro','Falha ao convidar'); return false; }
    finally { setInviting(false); }
  }, [selectedGroup, selectedFriend]);

  const removeMember = useCallback(async (email) => {
    if (!selectedGroup?.id) return false;
    try {
      await groupsService.removeMember(selectedGroup.id, email);
      setEditMembers(prev => prev.filter(m => m.email !== email));
      return true;
    } catch (e) { console.error(e); Alert.alert('Erro','Falha ao remover'); return false; }
  }, [selectedGroup]);

  const saveChanges = useCallback(async () => {
    if (!selectedGroup?.id) return null;
    if (!editStartDate || !editFinishDate) { Alert.alert('Erro','Preencha datas'); return null; }
    setSaving(true);
    try {
      const payload = { icone: editIcon, recompensa: editReward, data_inicio: parseToISO(editStartDate), data_termino: parseToISO(editFinishDate) };
      const res = await groupsService.updateGroup(selectedGroup.id, payload);

      const updated = res && (res.group || res.updatedGroup) ? (res.group || res.updatedGroup) : res;
      return updated;
    } catch (e) { console.error(e); Alert.alert('Erro','Falha ao salvar'); return null; }
    finally { setSaving(false); }
  }, [selectedGroup, editStartDate, editFinishDate, editIcon, editReward]);

  return {
    selectedGroup, selectGroup, clearSelection: ()=> { setSelectedGroup(null); resetEditState(); },
    editName, setEditName, editIcon, setEditIcon, editReward, setEditReward,
    editStartDate, setEditStartDateFormatted, editFinishDate, setEditFinishDateFormatted,
    editMembers, setEditMembers, loadMembers: ()=> {/* call service getMembers */},
    friends, loadFriends, loadingFriends, selectedFriend, setSelectedFriend,
    inviteMember, removeMember, saveChanges,
    loadingGroup, saving, inviting
  };
}
