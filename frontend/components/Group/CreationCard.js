import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function CreationCard({ onNavigate }) {
    return (
        <TouchableOpacity 
            style={styles.creationCard} 
            onPress={() => onNavigate('createGroup')}
        >
            <View style={styles.creationContent}>
                <View>
                    <FontAwesome name="plus-circle" size={35} color={"#14B8A6"} />
                </View>
                <Text style={styles.creationTitle}>Criar Novo Grupo</Text>
                <Text style={styles.creationSubtitle}>Convide Amigos e comece um novo desafio!</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    creationCard: {
        width: '100%',
        backgroundColor: "#1F2937", 
        borderRadius: 10, 
        padding: 20,
        marginBottom: 20,
    },
    creationContent: {
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 10,
    },
    creationTitle: {
        marginTop: 5,
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFF",
    },
    creationSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 4,
    },
});
