import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    } else {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
};

const MemberAvatarStack = ({ membersDesc }) => {
    const members = Array.isArray(membersDesc) ? membersDesc : [];
    const maxVisibleAvatars = 3;
    const totalMembers = members.length;

    const visibleMembers = members.slice(0, maxVisibleAvatars).reverse();
    const extraMembers = totalMembers - visibleMembers.length;

    const avatarColors = ["#34D399", "#00C49F", "#34D399"];

    return (
        <View style={styles.avatarStackContainer}>
            {visibleMembers.map((member, index) => (
                <View
                    key={index}
                    style={[
                        styles.avatarCircle,
                        {
                            backgroundColor: avatarColors[index % avatarColors.length],
                            marginLeft: index > 0 ? -12 : 0,
                            zIndex: 10 - index,
                        }
                    ]}
                >
                    <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
                </View>
            ))}
            {extraMembers > 0 && (
                <View style={styles.avatarExtra}>
                    <Text style={styles.avatarExtraText}>+{extraMembers}</Text>
                </View>
            )}
        </View>
    );
};

export default function GroupProgressCard({ group, onPress }) {

    return (
        <TouchableOpacity style={styles.groupCard} onPress={() => onPress(group)}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                    <FontAwesome5 name={group.icon} size={18} color={"#6C5CE7"} />
                </View>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.groupName}>{group.name}</Text>
                </View>

                <View style={styles.memberAvatar}>
                    <MemberAvatarStack membersDesc={group.membersDesc} />
                </View>
            </View>

            <Text style={styles.groupProgress}>
                Progresso do grupo: <Text style={styles.progressValueText}>{group.progress}/{group.total} dias</Text>
            </Text>

            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${(group.progress / group.total) * 100}%` }]} />
            </View>

            <View style={styles.separator} />

            <View style={styles.cardFooter}>
                <Text style={styles.rewardText}>Recompensa: <Text style={styles.rewardDescText}>{group.reward}</Text></Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    groupCard: {
        width: '100%',
        backgroundColor: "#1F2937",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardIconContainer: {
        backgroundColor: "#374151",
        padding: 8,
        borderRadius: 50,
        marginRight: 10,
    },
    headerTextContainer: { 
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFF",
    },
    groupProgress: {
        color: "#9CA3AF",
        marginTop: 4,
        fontSize: 12,
    },
    progressValueText: {
        fontWeight: 'bold',
        color: "#FFF",
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "#374151",
        borderRadius: 10,
        marginTop: 4,
        width: '100%'
    },
    progressBar: {
        height: '100%',
        backgroundColor: "#00C49F",
        borderRadius: 10,
        width: '100%'
    },
    memberAvatar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: "#374151",
        marginVertical: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rewardText: {
        color: "#9CA3AF",
    },
    rewardDescText: {
        color: "#FFF",
        fontWeight: '600',
    },
    avatarStackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarExtra: {
        backgroundColor: "#6C5CE7",
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarExtraText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: 'bold',
    },
    avatarCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: "#1F2937",
    },
    avatarText: {
        color: "#FFF",
        fontWeight: 'bold',
    },
});
