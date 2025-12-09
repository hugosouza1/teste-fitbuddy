import { useState, useEffect } from 'react';
import {ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

function useDebounce(value, delay) {
    const[debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])
    
    return debouncedValue
}

const GymSelector = ({ isVisible, onClose, onSelectGym, openGymRegister}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [gyms, setGyms] = useState(null);
    const [loading, setLoading] = useState(false);
    const [invalidTerm, setInvalidTerm] = useState(false)   

    const termDebounced = useDebounce(searchTerm, 1000)
    const cityDebounced = useDebounce(searchCity, 1000) 

    useEffect(() => {
        if(!termDebounced && !cityDebounced) {
            setGyms(null)
            return
        }

        if(termDebounced.trim().length < 3) {
            setInvalidTerm(true)
            setGyms([])
            return
        }
        
        const search = async () => {
            setLoading(true)
            const queryParams = (searchCity.trim().length > 0) ? `?city=${searchCity}` : ''
            try {
                const url = `${BACKEND_URL}/api/gym/search/${searchTerm}${queryParams}`
                const response = await fetch(encodeURI(url))
                const data = await response.json()
                setGyms(data)
            } catch(error) {
                console.log("Erro ao buscar academias." + error)
            } finally {
                setLoading(false)
            }
        }
        
        setInvalidTerm(false)
        search()
    }, [termDebounced, cityDebounced])

    const handleSelect = (gym) => {
        onSelectGym(gym);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Busque sua academia</Text>
                    
                    {/* Buscar Academia */}
                    <TextInput
                        style={[modalStyles.searchInput, invalidTerm && {borderWidth: 1, borderColor: '#F00'}]}
                        placeholder="Nome da academia"
                        placeholderTextColor="#9CA3AF"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />

                    <TextInput
                        style={modalStyles.searchInput}
                        placeholder="Cidade (opcional)"
                        placeholderTextColor="#9CA3AF"
                        value={searchCity}
                        onChangeText={setSearchCity}    
                    />

                    {loading && <ActivityIndicator size="small" color="#0099ff" />}

                    {/* Resultados */}
                    <FlatList
                        data={gyms}
                        keyExtractor={item => item.id.toString()}
                        style={modalStyles.listContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={modalStyles.listItem} onPress={() => handleSelect(item)}>
                                <Text style={modalStyles.listItemText}>{item.nome}</Text>
                                <Text style={modalStyles.listItemDescription}>{item.logradouro}, {item.cidade}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={modalStyles.emptyText}>Nenhuma academia encontrada.</Text>
                        )}
                    />

                    {/* Criar nova acad */}
                    <View style={modalStyles.separator} />
                    <Text style={modalStyles.subtitle}>Não encontrou? Cadastre a sua:</Text>
                    <TouchableOpacity 
                        style={modalStyles.addButton} 
                        onPress={openGymRegister}
                    >
                        <Text style={modalStyles.addButtonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                        <Text style={modalStyles.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
    },
    searchInput: {
        width: '100%',
        backgroundColor: '#4B5563',
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 15,
        color: '#FFF',
        marginBottom: 15,
    },
    listContainer: {
        width: '100%',
        maxHeight: 100, 
        marginBottom: 15,
        borderRadius: 8,
    },
    listItem: {
        padding: 12,
        backgroundColor: '#374151',
        borderBottomWidth: 1,
        borderBottomColor: '#4B5563',
    },
    listItemText: {
        color: '#FFF',
        fontSize: 16,
    },
    listItemDescription: {
        color: '#EEE',
        fontSize: 12,
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        padding: 20,
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#6C5CE7',
        marginVertical: 10,
    },
    subtitle: {
        color: '#FFF',
        marginBottom: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#6C5CE7',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 5,
    },
    buttonDisabled: {
        backgroundColor: '#4B5563',
        opacity: 0.6,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
    },
    closeButtonText: {
        color: '#00C49F',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GymSelector;