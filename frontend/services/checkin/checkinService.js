import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'

export async function getTodayCheckIn() {
  const userEmail = await AsyncStorage.getItem('email')
  if(!userEmail) throw new Error("Usuário não encontrado")

  let checkIn = null
  const url = `${BACKEND_URL}/api/checkin/today/${userEmail}`
  const result =  await fetch(url)
  const data = await result.json()

  if(!result.ok) throw new Error(data.error)
  
  checkIn = data.checkin_hoje
  return checkIn
}

export async function registerCheckin(email, imageURL) {
  const url = `${BACKEND_URL}/api/checkin/register`
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      fotoURL: imageURL
    })
  })

  if(!result.ok) {
    const data = await result.json()
    throw new Error(data.error)
  }

  return true
}