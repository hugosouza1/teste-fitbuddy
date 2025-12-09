import { Platform } from 'react-native';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export async function fetchGroups(email) {
  const res = await fetch(`${BACKEND_URL}/api/groups/getGrupos?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const raw = (data.grupos ?? data.rows ?? data);
  return (raw || []).map(g => ({
    id: g.id,
    name: g.nome,
    icon: g.icone,
    reward: g.recompensa,
    startDate: g.data_inicio,
    finishDate: g.data_termino,
    membersDesc: [],
  }));
}

export async function createGroup(payload) {
  const res = await fetch(`${BACKEND_URL}/api/groups/createGrupo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text().catch(()=>`Erro ${res.status}`));
  return res.json();
}

export async function getMembers(groupId) {
  const res = await fetch(`${BACKEND_URL}/api/groups/getMembers/${groupId}`);
  if (!res.ok) throw new Error('Erro getMembers');
  const data = await res.json().catch(() => null);
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.members)) return data.members;
  return [];
}

export async function inviteMember(groupId, email) {
  const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error(await res.text().catch(()=>'Erro convite'));
  return res.json();
}

export async function removeMember(groupId, email) {
  const res = await fetch(`${BACKEND_URL}/api/groups/removeMember`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: groupId, email })
  });
  if (!res.ok) throw new Error('Erro removeMember');
  return res.json();
}

export async function updateGroup(groupId, payload) {
  const res = await fetch(`${BACKEND_URL}/api/groups/updateGroup/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=>null);
  if (!res.ok) throw new Error((data && (data.error || data.message)) || `Erro ${res.status}`);
  return data;
}

export async function fetchFriends(email) {
  const res = await fetch(`${BACKEND_URL}/api/groups/friends/${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Erro friends');
  return res.json();
}
