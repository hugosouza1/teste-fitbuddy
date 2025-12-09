import { ActivityIndicator,  Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCheckin } from '../hooks/checkin/useCheckIn';

const checkInScreen = () => {
  const { image, loading, loadingText, checkInToday, pickImage, checkIn } = useCheckin() 

  if(loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C49F" />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }
  
  if(checkInToday) {
    return (
      <View style={[styles.container, styles.checkInMade]}>
        <Text style={styles.title}>Parabéns, de hoje está pago!</Text>
        <Text style={styles.description}>Volte amanhã após o seu treino para fazer um novo checkin.</Text>
        <Image source={require('../../assets/concluido-icon.png')} style={styles.concludedImage}/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-In</Text>
      <Text style={styles.description}>Adicione uma foto do seu treino de hoje para registrar seu check-in.</Text>
      
      <Pressable style={styles.chooseButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Escolher foto</Text>
      </Pressable>
      <View style={styles.imageContainer}>
        {image && (<Image source={{ uri: image }} style={styles.image}/>)}
      </View>
      <Pressable 
        disabled={!image} 
        style={[styles.sendButton, (!image) ? styles.buttonDisabled : styles.sendButton]}
        onPress={checkIn}
      >
        <Text style={styles.buttonText}>Enviar</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    width: '90%',
    alignSelf: 'center'
  },
  checkInMade: {
    height: 500,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  concludedImage: {
    alignSelf: 'center',
    height: 120,
    marginVertical: 50,
    width: 120,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  description: {
    color: '#DDD',
    marginTop: 10,
    fontSize: 12,
  },
  chooseButton: {
    alignSelf: 'center',
    backgroundColor: '#6C5CE7',
    borderRadius: 30,
    marginVertical: 15,
    paddingVertical: 5,
    width: 200,
  },
  sendButton: {
    alignSelf: 'center',
    backgroundColor: '#DB2777',
    borderRadius: 30,
    marginVertical: 25,
    paddingVertical: 5,
    width: 200,
  },
  buttonDisabled: {
    backgroundColor: '#555a',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    alignSelf: 'center',
    backgroundColor: '#333',
    borderRadius: 5,
    height: 200,
    width: 200,
  },
  image: {
    height: 200,
    width: 200,
  }
})

export default checkInScreen