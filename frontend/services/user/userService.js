import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const DEFAULT_PROFILE_PIC = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

import { parsePotentialDate } from '../../utils/date';

export async function carregarUsuario(email) {
  if (!email) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/user/profile/${encodeURIComponent(email)}`);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('Erro ao buscar perfil:', res.status, errText);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
      return null;
    }
    const data = await res.json();

    const emailToStore = data.email || email;
    const nomeToStore = data.nome || data.name || '';
    const possibleDate = data.data_nascimento ?? data.birthDate ?? null;
    const parsedDate = parsePotentialDate(possibleDate) ?? '';
    const objetivoToStore = data.objetivo ?? data.goal ?? '';
    const descricaoToStore = data.descricao ?? data.bio ?? '';
    const experienciaToStore = data.experiencia ?? data.experience ?? '';
    const fotoToStore = data.foto ?? data.photo ?? data.avatar ?? DEFAULT_PROFILE_PIC;
    const localToStore = data.local ?? data.location ?? '';
    const gostoMusicalToStore = data.gosto_musical ?? data.music ?? '';
    const createdAtToStore = data.created_at ?? data.createdAt ?? '';

    // horarios
    let horarios = [];
    if (Array.isArray(data.horarios) && data.horarios.length) {
      horarios = data.horarios.filter(Boolean);
    } else if (Array.isArray(data.horario) && data.horario.length) {
      horarios = data.horario.filter(Boolean);
    } else if (typeof data.horarios === 'string' && data.horarios.trim()) {
      horarios = [data.horarios.trim()];
    } else if (typeof data.horario === 'string' && data.horario.trim()) {
      horarios = [data.horario.trim()];
    } else {
      horarios = [];
    }

    // academia (obj ou null)
    let academiaObj = null;
    if (Array.isArray(data.academia) && data.academia.length > 0) academiaObj = data.academia[0];
    else if (data.academia && typeof data.academia === 'object') academiaObj = data.academia;
    else academiaObj = null;

    const entries = [
      ['email', String(emailToStore)],
      ['nome', String(nomeToStore)],
      ['data_nascimento', String(parsedDate)],
      ['objetivo', String(objetivoToStore)],
      ['descricao', String(descricaoToStore)],
      ['experiencia', String(experienciaToStore)],
      ['foto', String(fotoToStore)],
      ['local', String(localToStore)],
      ['gosto_musical', String(gostoMusicalToStore)],
      ['created_at', String(createdAtToStore)],
      ['academia_obj', JSON.stringify(academiaObj ?? {})],
      ['horarios', JSON.stringify(horarios)],
    ];
    
    await AsyncStorage.multiSet(entries);

    return {
      email: emailToStore,
      nome: nomeToStore,
      data_nascimento: parsedDate,
      objetivo: objetivoToStore,
      descricao: descricaoToStore,
      experiencia: experienciaToStore,
      foto: fotoToStore,
      local: localToStore,
      gosto_musical: gostoMusicalToStore,
      created_at: createdAtToStore,
      academia: academiaObj,
      horarios
    };
  } catch (err) {
    console.error('Erro no fetch do perfil:', err);
    Alert.alert('Erro', 'Falha ao comunicar com o servidor.');
    return null;
  }
}

export async function deleteAccount(email){
  const res = await fetch( 
    `${BACKEND_URL}/api/user/deleteProfile/${encodeURIComponent(email)}`,
    { method: 'DELETE' }
  );
  
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Erro ao apagar a conta:', res.status, txt)
  }
  return res.json()
}