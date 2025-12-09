import AsyncStorage from '@react-native-async-storage/async-storage';

export async function aceitarSolicitacaoDeAmizade(BACKEND_URL, parceiroEmail) {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")
  try {
    const response = await fetch(`${BACKEND_URL}/api/partners/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userEmail: userEmail,
        partnerEmail: parceiroEmail
      })
    });
    const data = await response.json();
    console.log("Solicitação aceita:", data);
  } catch (error) {
    console.log("Erro ao aceitar:", error);
    return false
  }
  return true
}

export async function negarSolicitacaoDeAmizade(BACKEND_URL, parceiroEmail) {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")

  try {
    const response = await fetch(`${BACKEND_URL}/api/partners/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userEmail: userEmail,
        partnerEmail: parceiroEmail
      })
    });

    const data = await response.json()
    console.log("Solicitação rejeitada:", data)
  } catch (error) {
    console.log("Erro ao rejeitar:", error)
    return false
  }
  return true
}

export async function enviarSolicitacaoDeAmizade(BACKEND_URL, parceiroEmail) {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")

  try {
    const response = await fetch(`${BACKEND_URL}/api/partners/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userEmail: userEmail,
        partnerEmail: parceiroEmail
      })
    });

    const data = await response.json()
    console.log("Solicitação enviada:", data)
  } catch (error) {
    console.log("Erro ao enviar solicitação:", error)
    return false
  }
  return true
}