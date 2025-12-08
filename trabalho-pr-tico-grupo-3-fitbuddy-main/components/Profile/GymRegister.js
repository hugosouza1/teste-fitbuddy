import React, {useState, useEffect} from "react";
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const GymRegister = ({isVisible, onClose}) => {
  const [gymName, setGymName] = useState('')
  const [gymCity, setGymCity] = useState('')
  const [gymAddress, setGymAddress] = useState('')
  const [invalidTerm, setInvalidTerm] = useState({
    name: false,
    city: false,
    address: false
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [registerFailure, setRegisterFailure] = useState(false)
  const [failureMessage, setFailureMessage] = useState('')

  const registerGym = async () => {
    setInvalidTerm({
      name: false,
      city: false,
      address: false
    })
    setRegisterFailure(false)

    if(gymName.trim().length < 3) {
      setInvalidTerm(prev => ({...prev, name: true}))
      setErrorMessage('Campo obrigatório. Número de caracteres insuficiente.')
      return;
    }
    if(gymCity.trim().length < 3) {
      setInvalidTerm(prev => ({...prev, city: true}))
      setErrorMessage('Campo obrigatório. Número de caracteres insuficiente.')
      return;
    }
    if(gymAddress.trim().length < 3) {
      setInvalidTerm(prev => ({...prev, address: true}))
      setErrorMessage('Campo obrigatório. Número de caracteres insuficiente.')
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/gym/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: gymName,
        city: gymCity,
        address: gymAddress,
      }),
    })
    const data = await response.json()
    if(!response.ok) {
      console.log(data)
      setRegisterFailure(true)
      setFailureMessage(data.error)
      return
    }
    alert("Academia cadastrada com sucesso.")
    setGymName('')
    setGymCity('')
    setGymAddress('')
    onClose()
  }

  return (
    <Modal 
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cadastro de academia</Text>
          <Text style={styles.inputLabel}>Nome:</Text>
          <TextInput
            style={[styles.input, invalidTerm.name && {borderWidth: 1, borderColor: '#F00'}]}
            placeholder="Minha academia"
            placeholderTextColor="#9CA3AF"
            value={gymName}
            onChangeText={(text) => {
              setGymName(text)
              setInvalidTerm(prev => ({...prev, name: false}))
              setRegisterFailure(false)
            }}
          />
          {invalidTerm.name && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <Text style={styles.inputLabel}>Cidade:</Text>
          <TextInput
            style={[styles.input, invalidTerm.city && {borderWidth: 1, borderColor: '#F00'}]}
            placeholder="Belo Horizonte"
            placeholderTextColor="#9CA3AF"
            value={gymCity}
            onChangeText={(text) => {
              setGymCity(text)
              setInvalidTerm(prev => ({...prev, city: false}))
              setRegisterFailure(false)
            }}
          />
          {invalidTerm.city && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <Text style={styles.inputLabel}>Endereço:</Text>
          <TextInput
            style={[styles.input, invalidTerm.address && {borderWidth: 1, borderColor: '#F00'}]}
            placeholder="Rua ABC, nº 20"
            placeholderTextColor={"#9CA3AF"}
            value={gymAddress}
            onChangeText={(text) => {
              setGymAddress(text)
              setInvalidTerm(prev => ({...prev, address: false}))
              setRegisterFailure(false)
            }}
          />
          {invalidTerm.address && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <TouchableOpacity 
              style={styles.registerButton} 
              onPress={registerGym}
          >
              <Text style={styles.registerButtonText}>Cadastrar</Text>
          </TouchableOpacity>
          {registerFailure && <Text style={styles.errorMessage}>{failureMessage}</Text>}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>

    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    elevation: 5,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center'
  },
  inputLabel: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 5
  },
  input: {
    backgroundColor: '#4B5563',
    borderRadius: 10,
    color: '#FFF',
    height: 50,
    marginBottom: 10,
    paddingHorizontal: 15,
    width: '100%',
  },
  errorMessage: {
    color: '#F00',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    marginVertical: 10,
    padding: 12,
    width: '100%',
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
  },
  closeButtonText: {
    color: '#00C49F',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },

})

export default GymRegister;