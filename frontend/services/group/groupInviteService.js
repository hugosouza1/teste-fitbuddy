import AsyncStorage from '@react-native-async-storage/async-storage';

export async function acceptGroupInvite(BACKEND_URL, groupId) {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")

  const response = await fetch(`${BACKEND_URL}/api/groups/accept-invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      groupId: groupId,
      userEmail: userEmail
    })
  });
  if (!response.ok) throw new Error(await response.text().catch(()=>'Erro convite'));
  return true
}

export async function rejectGroupInvite(BACKEND_URL, groupId) {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")

  const response = await fetch(`${BACKEND_URL}/api/groups/reject-invite`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      groupId: groupId,
      userEmail: userEmail
    })
  });
  if(!response.ok) {
    throw new Error("Erro ao rejeitar convite de grupo:", error)
  }
  return true
}
