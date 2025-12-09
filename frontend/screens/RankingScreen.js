import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function RankingScreen() {
  const [email, setEmail] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(null);

  const [me, setMe] = useState(null);
  const [ranking, setRanking] = useState([]);

  const [loading, setLoading] = useState(true);
  const [erroGrupo, setErroGrupo] = useState(null);

  const [groupModalVisible, setGroupModalVisible] = useState(false);

  // ============================
  // Carrega grupos do usuário
  // ============================
  const fetchGroups = async (userEmail) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/groups/getGrupos?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!res.ok) {
        console.log("[RankingScreen] erro HTTP em getGrupos:", res.status);
        return [];
      }

      const data = await res.json();

      const raw = data.grupos ?? data.rows ?? data ?? [];
      return raw.map((g) => ({
        id: g.id,
        nome: g.nome,
        icone: g.icone,
        recompensa: g.recompensa,
        data_inicio: g.data_inicio,
        data_termino: g.data_termino,
      }));
    } catch (err) {
      console.log("[RankingScreen] Erro ao carregar grupos:", err);
      return [];
    }
  };

  // ============================
  // Carrega ranking do grupo
  // ============================
  const loadRanking = async (selectedGroupId, userEmail) => {
    if (!selectedGroupId || !userEmail) {
      setErroGrupo("Selecione um grupo para ver o ranking.");
      setMe(null);
      setRanking([]);
      return;
    }

    try {
      setLoading(true);
      setErroGrupo(null);

      const personalUrl = `${BACKEND_URL}/api/ranking/group/${selectedGroupId}/personal/${userEmail}`;
      const listUrl = `${BACKEND_URL}/api/ranking/group/${selectedGroupId}/list`;

      const resPersonal = await fetch(personalUrl);
      const dataPersonal = await resPersonal.json();

      if (!resPersonal.ok) {
        setErroGrupo(dataPersonal.error || "Erro ao carregar ranking pessoal");
        setMe(null);
        setRanking([]);
        setLoading(false);
        return;
      }

      setMe(dataPersonal);

      const resList = await fetch(listUrl);
      const dataList = await resList.json();

      if (!resList.ok) {
        setErroGrupo(dataList.error || "Erro ao carregar ranking do grupo");
        setRanking([]);
        setLoading(false);
        return;
      }

      const sorted = (Array.isArray(dataList) ? dataList : []).sort(
        (a, b) => Number(b.pontos || 0) - Number(a.pontos || 0)
      );

      setRanking(sorted);
    } catch (err) {
      console.log("[RankingScreen] Erro geral:", err);
      setErroGrupo("Erro inesperado ao carregar o ranking.");
      setMe(null);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Efeito inicial
  // ============================
  useEffect(() => {
    const init = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedGroupId = await AsyncStorage.getItem("selectedGroupId");

        if (!savedEmail) {
          setErroGrupo("Usuário não encontrado.");
          setLoading(false);
          return;
        }

        setEmail(savedEmail);

        const grupos = await fetchGroups(savedEmail);
        setGroups(grupos);

        if (!grupos.length) {
          setErroGrupo("Você ainda não participa de nenhum grupo.");
          setLoading(false);
          return;
        }

        const initialGroupId =
          savedGroupId && grupos.some((g) => String(g.id) === String(savedGroupId))
            ? savedGroupId
            : String(grupos[0].id);

        setGroupId(initialGroupId);
        await AsyncStorage.setItem("selectedGroupId", String(initialGroupId));

        await loadRanking(initialGroupId, savedEmail);
      } catch (err) {
        console.log("[RankingScreen] Erro init:", err);
        setErroGrupo("Erro ao inicializar a tela de ranking.");
        setLoading(false);
      }
    };

    init();
  }, []);

  // ============================
  // Trocar grupo pela UI
  // ============================
  const handleSelectGroup = async (id) => {
    const idStr = String(id);
    setGroupId(idStr);

    await AsyncStorage.setItem("selectedGroupId", idStr);

    if (email) {
      loadRanking(idStr, email);
    }
  };

  // ============================
  // Render
  // ============================
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Carregando ranking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ranking do Grupo</Text>

      {/* =============================== */}
      {/* SELETOR DE GRUPOS (DROPDOWN)   */}
      {/* =============================== */}
      <View style={styles.groupSelector}>
        <Text style={styles.groupSelectorLabel}>Grupo selecionado:</Text>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setGroupModalVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {groups.find((g) => String(g.id) === String(groupId))?.nome ||
              "Selecione um grupo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* =============================== */}
      {/* MODAL DE SELEÇÃO DE GRUPOS     */}
      {/* =============================== */}
      <Modal
        visible={groupModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecione um grupo</Text>

            <FlatList
              data={groups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setGroupModalVisible(false);
                    handleSelectGroup(item.id);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setGroupModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =============================== */}
      {/* RANKING                        */}
      {/* =============================== */}
      {erroGrupo ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff", textAlign: "center", paddingHorizontal: 20 }}>
            {erroGrupo}
          </Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.email}
          style={{ marginTop: 10 }}
          renderItem={({ item, index }) => {
            const pos = index + 1;

            let positionColor =
              pos === 1
                ? "#FACC15"
                : pos === 2
                ? "#9CA3AF"
                : pos === 3
                ? "#F97316"
                : "#64748B";

            const hasPhoto = item.foto && item.foto.trim() !== "";

            const initials =
              item.nome
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "?";

            return (
              <View style={styles.rankingCard}>
                <Text style={[styles.positionNumber, { color: positionColor }]}>
                  {pos}
                </Text>

                {hasPhoto ? (
                  <Image source={{ uri: item.foto }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.nome}</Text>
                  <Text style={styles.userSub}>{item.pontos} check-ins</Text>
                </View>

                <Text style={[styles.star, { color: positionColor }]}>★</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// =====================================
// ESTILOS
// =====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0F1724",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F1724",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  // SELECTOR
  groupSelector: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupSelectorLabel: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 14,
  },
  dropdownButton: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalItemText: {
    color: "#fff",
    fontSize: 16,
  },
  modalClose: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#575757ff",
    borderRadius: 8,
  },
  modalCloseText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  // RANKING LIST
  rankingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },
  positionNumber: {
    fontSize: 22,
    width: 28,
    textAlign: "center",
    fontWeight: "bold",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#22D3EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  userSub: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 2,
  },
  star: {
    fontSize: 22,
    marginLeft: 12,
  },
});