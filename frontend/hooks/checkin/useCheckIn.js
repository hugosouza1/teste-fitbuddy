import React, {useCallback, useState, useEffect} from 'react'
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteImageFromFirebase, uploadToFirebase } from '../../services/pictureService';
import { getTodayCheckIn, registerCheckin } from '../../services/checkin/checkinService';
import { Alert } from 'react-native';

export function useCheckin() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [checkInToday, setCheckInToday] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingText('')
      setLoading(true)
  
      try {
        const checkIn = await getTodayCheckIn()
        setCheckInToday(checkIn)
      } catch(err) {
        setCheckInToday(false)
        Alert.alert('Erro', 'Não foi possível recuperar seu check-in diário.')
        console.log(err)
      }
      
      setLoading(false)
    })()
  }, [])

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
      setImage(uri)
    }
  }, []);
  
  const checkIn = useCallback(async () => {
    setLoadingText('Processando seu check-in...')
    setLoading(true)
    if(!image) {
      Alert.alert('Erro', 'É preciso enviar uma imagem do seu treino para realizar o check-in.')
      return
    } 
    const userEmail = await AsyncStorage.getItem('email')
    if(!userEmail) throw new Error("Usuário não encontrado")
    const imageName = image.split("/").pop();
    const imageStoragePath = `users/${userEmail}/checkin/${Date.now()}_${imageName}`
    
    try {
      const imageURL = await uploadToFirebase(image, imageStoragePath)
      await registerCheckin(userEmail, imageURL)
      setCheckInToday(true)

    }catch (err) {
      try {
        await deleteImageFromFirebase(imageStoragePath)
      } catch(err) {
        console.log('Erro ao deletar foto do firebase', err)
      }
      setCheckInToday(false)
      Alert.alert('Erro', 'Erro ao registrar seu check-in. Tente novamente mais tarde.')
    } finally { 
      setLoading(false)
    }
  }, [image])

  return {
    image,
    loading,
    loadingText,
    checkInToday,
    pickImage,
    checkIn
  }
}