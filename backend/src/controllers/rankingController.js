const { pool } = require("../../database/pool");

exports.getGroupPersonalRanking = async (req, res) => {
  try {
    const { groupId, email } = req.params;

    if (!groupId || !email) {
      return res.status(400).json({ error: "groupId e email são obrigatórios" });
    }

    const userResult = await pool.query(
      `SELECT nome, foto FROM usuarios WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const { nome, foto } = userResult.rows[0];

    const rankingResult = await pool.query(
      `
      SELECT 
        m.email,
        COALESCE(m.pontos, 0) AS pontos,
        u.nome,
        u.foto
      FROM membros_de m
      LEFT JOIN usuarios u ON u.email = m.email
      WHERE m.id_grupo = $1
      ORDER BY m.pontos DESC, m.email ASC
      `,
      [groupId]
    );

    const ranking = rankingResult.rows;

    if (ranking.length === 0) {
      return res.status(404).json({ error: "Grupo sem membros ou inexistente" });
    }

    const totalUsuarios = ranking.length;


    let idx = ranking.findIndex((r) => r.email === email);

    if (idx === -1) {
      return res.status(403).json({ error: "Usuário não pertence a este grupo" });
    }

    const posicao = idx + 1;
    const pontos = Number(ranking[idx].pontos || 0);

    return res.json({
      nome,
      foto,
      pontos,
      posicao,
      totalUsuarios,
    });
  } catch (error) {
    console.error("Erro no ranking pessoal do grupo:", error);
    res.status(500).json({ error: "Erro ao obter ranking pessoal do grupo" });
  }
};


exports.getGroupRankingList = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ error: "groupId é obrigatório" });
    }

    const rankingResult = await pool.query(
      `
      SELECT 
        m.email,
        COALESCE(m.pontos, 0) AS pontos,
        u.nome,
        u.foto
      FROM membros_de m
      LEFT JOIN usuarios u ON u.email = m.email
      WHERE m.id_grupo = $1
      ORDER BY m.pontos DESC, m.email ASC
      `,
      [groupId]
    );

    const ranking = rankingResult.rows.map((row, index) => ({
      email: row.email,
      nome: row.nome,
      foto: row.foto,
      pontos: Number(row.pontos || 0),
      posicao: index + 1,
    }));

    return res.json(ranking);
  } catch (error) {
    console.error("Erro no ranking completo do grupo:", error);
    res.status(500).json({ error: "Erro ao obter ranking do grupo" });
  }
};