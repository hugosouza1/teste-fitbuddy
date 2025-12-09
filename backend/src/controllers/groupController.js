const { getClient, pool } = require('../../database/pool');

const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { nome, recompensa, icone, data_inicio, data_termino } = req.body;

    if (!id) return res.status(400).json({ error: 'ID do grupo não fornecido.' });

    const groupPayload = { nome, recompensa, icone, data_inicio, data_termino };

    const camposParaAtualizar = {};
    for (const key in groupPayload) {
        if (groupPayload[key] !== undefined) {
            camposParaAtualizar[key] = groupPayload[key];
        }
    }

    if (Object.keys(camposParaAtualizar).length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização.' });
    }

    const client = await getClient();

    try {
        await client.query('BEGIN');

        const checkRes = await client.query('SELECT id FROM grupos WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        const keys = Object.keys(camposParaAtualizar);
        const setClauses = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = Object.values(camposParaAtualizar);
        values.push(id);

        const updateQuery = `
            UPDATE grupos
            SET ${setClauses}
            WHERE id = $${values.length}
            RETURNING *;
        `;

        const result = await client.query(updateQuery, values);

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'Grupo atualizado com sucesso!',
            group: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar grupo:', err);
        return res.status(500).json({ error: 'Erro interno ao atualizar grupo.' });
    } finally {
        client.release();
    }
};

const inviteMembers = async (req, res) => {
    const { id } = req.params; 
    const { email } = req.body; 

    if(!id){
        return res.status(400).json({ error: 'ID do grupo não fornecido.' });
    }

    if(!email){
        return res.status(400).json({ error: 'Email inválido.', email });
    }

    const client = await getClient();

    try{
        await client.query('BEGIN');

        const sql = `
                INSERT INTO convites_grupo (id_grupo, email_convidado)
                VALUES ($1, $2)
                ON CONFLICT (id_grupo, email_convidado) DO NOTHING
        `;

        await client.query(sql, [id, email]);

        await client.query('COMMIT');
        
        return res.status(201).json({ message: 'Convites enviados com sucesso!'});

    }catch(err){
        await client.query('ROLLBACK');
        
        if (err.code === '23503') {
            console.warn(`[inviteMembers] Falha de FK: ${err.detail}`);
            return res.status(404).json({ error: 'Grupo não encontrado ou um dos usuários convidados não existe.' });
        }

        console.error('Erro ao enviar convites:', err);
        return res.status(500).json({ error: 'Erro interno ao enviar convites.' });
    }finally{
        client.release();
    }
};

const getGrupos = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    try {
        const sql = `
            SELECT g.id, g.nome, g.recompensa, g.icone, g.data_inicio, g.data_termino
            FROM membros_de m
            LEFT JOIN grupos g ON g.id = m.id_grupo
            WHERE m.email = $1
        `;

        const result = await pool.query(sql, [email]);
        
        return res.status(200).json(result.rows || []);

    } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

const createGrupo = async (req, res) => {
  const { nome, icone, recompensa, data_inicio, data_termino, email } = req.body;

  if (!nome || !icone || !recompensa || !data_inicio || !data_termino || !email) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const client = await getClient(); 
  try {
    await client.query('BEGIN');

    const insertGroupSQL = `
      INSERT INTO grupos (nome, icone, recompensa, data_inicio, data_termino)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const groupRes = await client.query(insertGroupSQL, [nome, icone, recompensa, data_inicio, data_termino]);
    const groupId = groupRes.rows[0].id;

    const insertMemberSQL = `
      INSERT INTO membros_de (id_grupo, email) VALUES ($1, $2)
    `;
    await client.query(insertMemberSQL, [groupId, email]);

    await client.query('COMMIT');
    return res.status(200).json({ id: groupId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
};

const removeMember = async (req, res) => {
  const { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sql = `DELETE FROM membros_de WHERE email = $1 AND id_grupo = $2`;
    const result = await client.query(sql, [email, id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Membro não encontrado no grupo' });
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Membro removido com sucesso' });
  } catch(err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
};

const getMembers = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID do grupo não fornecido.' });
  }

  try {
    const sql = `
      SELECT m.email, u.nome
      FROM membros_de m
      LEFT JOIN usuarios u ON u.email = m.email
      WHERE m.id_grupo = $1
      ORDER BY m.email
    `;

    const result = await pool.query(sql, [id]);

    return res.status(200).json({
      members: result.rows || []
    });

  } catch (err) {
    console.error('Erro ao buscar membros do grupo:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};


const getFriends = async (req, res) => {
  const { id: email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'Email não fornecido.' });
  }

  try {
    const sql = `
      SELECT DISTINCT email, name
      FROM (
          SELECT a.usuario1_email AS email, u.nome AS name
          FROM amigos a
          LEFT JOIN usuarios u ON u.email = a.usuario1_email
          WHERE a.usuario2_email = $1

          UNION ALL

          SELECT a.usuario2_email AS email, u.nome AS name
          FROM amigos a
          LEFT JOIN usuarios u ON u.email = a.usuario2_email
          WHERE a.usuario1_email = $1
      ) AS all_friends
      ORDER BY name;

    `;

    const result = await pool.query(sql, [email]);

    // Retorna array de {email, name}
    return res.status(200).json(result.rows || []);

  } catch (err) {
    console.error('Erro ao buscar amigos:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

const acceptGroupInvite = async (req, res) => {
  const { groupId, userEmail } = req.body;

  if (!groupId || !userEmail) {
    return res.status(400).json({ error: 'ID do grupo e email do usuário são obrigatórios.' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Adiciona usuário como membro do grupo
    const insertMemberSql = `
      INSERT INTO membros_de (id_grupo, email)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    await client.query(insertMemberSql, [groupId, userEmail]);

    // Remove o convite da tabela convites_grupo
    const deleteInviteSql = `
      DELETE FROM convites_grupo
      WHERE id_grupo = $1 AND email_convidado = $2
    `;
    await client.query(deleteInviteSql, [groupId, userEmail]);

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Convite aceito' });

  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { console.error('Rollback falhou', e); }
    console.error('Erro ao aceitar convite de grupo:', err);
    return res.status(500).json({ error: 'Erro ao aceitar convite de grupo' });
  } finally {
    try { client.release(); } catch (e) { /* ignore */ }
  }
};

const rejectGroupInvite = async (req, res) => {
  const { groupId, userEmail } = req.body;

  if (!groupId || !userEmail) {
    return res.status(400).json({ error: 'ID do grupo e email do usuário são obrigatórios.' });
  }

  try {
    const sql = `
      DELETE FROM convites_grupo
      WHERE id_grupo = $1 AND email_convidado = $2
    `;
    await pool.query(sql, [groupId, userEmail]);
    return res.status(200).json({ success: true, message: 'Convite rejeitado' });
  } catch (err) {
    console.error('Erro ao rejeitar convite de grupo:', err);
    return res.status(500).json({ error: 'Erro ao rejeitar convite de grupo' });
  }
};

module.exports = {
    updateGroup,
    getGrupos,
    inviteMembers,
    createGrupo,
    removeMember,
    getMembers,
    getFriends,
    acceptGroupInvite,
    rejectGroupInvite
};
