import { useState, useEffect, useCallback } from 'react';
import * as profileService from '../../services/profile/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { carregarUsuario } from '../../services//user/userService';
import { Alert } from 'react-native';
import { deleteImageFromFirebase, uploadToFirebase } from '../../services/pictureService';
import { deleteAccount } from '../../services/user/userService';

const EXPERIENCE_LEVELS = ['Iniciante', 'Regular', 'Avançado'];
const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;

const DEFAULT_PROFILE_PIC = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; 

import { parsePotentialDate, toBrazilDateString, toIsoDateString } from '../../utils/date';

export default function useProfile() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(null); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focus, setFocus] = useState('');
  const [gym, setGym] = useState({});
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS?.[0] ?? 'Iniciante');
  const [availableTimes, setAvailableTimes] = useState([]); // array de strings "HH:MM"
  const [newTime, setNewTime] = useState('');
  const [profilePic, setProfilePic] = useState(DEFAULT_PROFILE_PIC);
  const [newProfilePicture, setNewProfilePicture] = useState(false);

  const [loading, setLoading] = useState(false);   
  const [fetching, setFetching] = useState(false); 
  const [gymSelected, setGymSelected] = useState(false);

   
  const [isGymModalVisible, setIsGymModalVisible] = useState(false);
  const [isGymRegisterModalVisible, setIsGymRegisterModalVisible] = useState(false);

  // Carrega email do AsyncStorage (uma vez)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('email');
        if (mounted && stored) setEmail(stored);
      } catch (e) {
        console.warn('Erro ao ler AsyncStorage (userEmail):', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Carrega perfil sempre que o email mudar
  useEffect(() => {
    if (!email) return;
    let active = true;
    (async () => {
      setFetching(true);
      try {
        const data = await carregarUsuario(email);
        if (!active) return;
        if (!data) return;
        console.log("DATA",data)
        setName(data.nome || '');
        setEmail(data.email || email);
        setBirthDate(parsePotentialDate(data.data_nascimento) || null);
        setFocus(data.objetivo || '');
        setBio(data.descricao || '');
        setExperienceLevel(data.experiencia || EXPERIENCE_LEVELS?.[0]);
        setProfilePic(data.foto || DEFAULT_PROFILE_PIC);
        setAvailableTimes(Array.isArray(data.horarios) ? data.horarios : []);
        setGym(data.academia || {});
        setGymSelected(Boolean(data.academia));
      } catch (err) {
        console.error('Erro no loadProfile:', err);
        Alert.alert('Erro', 'Falha ao carregar perfil.');
      } finally {
        if (active) setFetching(false);
      }
    })();
    return () => { active = false; };
  }, [email]); 

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permissão necessária para acessar as fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if(!result.canceled) {
      const uri = result.assets[0].uri
      setProfilePic(uri)
      setNewProfilePicture(true)
    }
  }, []);

  const addTime = useCallback((formattedTime) => {
    const t = (formattedTime||'').trim();
    if (!timeRegex.test(t)) {
      Alert.alert('Erro', 'Formato de hora inválido. Use HH:MM (Ex: 18:30).');
      return false;
    }
    setAvailableTimes(prev => {
      if (prev.includes(t)) return prev;
      return [...prev, t].sort();
    });
    return true;
  }, []);

  const removeTime = useCallback((timeToRemove) => {
    setAvailableTimes(prev => prev.filter(time => time !== timeToRemove));
  }, []);

  const saveProfile = useCallback(async (emailArg) => {
    const payload = {
      email: emailArg,
      nome: name,
      data_nascimento: toIsoDateString(birthDate),
      objetivo: focus,
      descricao: bio,
      experiencia: experienceLevel,
      horario: availableTimes,
      academia: gym?.id,
      foto: (profilePic !== DEFAULT_PROFILE_PIC) ? profilePic : null
    };

    setLoading(true);
    try {
      if(newProfilePicture) {
        const url = await uploadToFirebase(profilePic, `users/${email}/profile.jpg`)
        payload.foto = url
      }
      const saved = await profileService.saveData(emailArg, payload);
      const ret = await carregarUsuario(email);
      return saved;
    } catch (e) {
      console.warn('saveProfile erro:', e);

      if(newProfilePicture) {
        try {
          deleteImageFromFirebase(`users/${email}/profile.jpg`)
        } catch(err) {
          console.log(err);
        }
      }

      throw e;
    } finally {
      setLoading(false);
    }
  }, [name, birthDate, focus, bio, experienceLevel, availableTimes, gym?.id, profilePic]);

  const deleteUserAccount = useCallback(async () => {
    try{
      await deleteAccount(email)
      return true
    } catch(err) {
      console.log(err)
      return false
    }
  }, [email]);

  const clearStorageAndLogout = useCallback(async (onNavigate) => {
    try {
      await AsyncStorage.clear();
      if (typeof onNavigate === 'function') onNavigate('login');
    } catch (e) {
        console.warn('Erro ao limpar storage:', e);
      Alert.alert('Erro', 'Não foi possível sair agora.');
    }
  }, []);

  return {
    // dados
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
    profilePic, setProfilePic,

    isGymModalVisible, setIsGymModalVisible,
    isGymRegisterModalVisible, setIsGymRegisterModalVisible,

    // flags
    loading, fetching,

    // actions
    addTime, removeTime,
    saveProfile,
    clearStorageAndLogout,
    pickImage, deleteUserAccount
  };
}
