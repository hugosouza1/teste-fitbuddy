const { getClient, pool } = require('../../database/pool');

const updateGroup = async (req, res) => {
  const { id } = req.params;
  console.log('updateGroup called for id:', id, 'body:', req.body);
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
        
        // Retorna sempre array (pode estar vazio)
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

    // Criar grupo
    const insertGroupSQL = `
      INSERT INTO grupos (nome, icone, recompensa, data_inicio, data_termino)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const groupRes = await client.query(insertGroupSQL, [nome, icone, recompensa, data_inicio, data_termino]);
    const groupId = groupRes.rows[0].id;

    // Adicionar usuário como membro
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



const addMember = async (req, res) => {
  const { email, id } = req.body;

  if (!email || !id) {
    console.log('Dados incompletos:', { email: !!email, id: !!id });
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sql = `INSERT INTO membros_de (email, id_grupo) VALUES ($1, $2)`;
    await client.query(sql, [email, id]);

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Membro adicionado com sucesso' });

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Erro ao adicionar membro:', err);

    if (err.code === '23505') { // chave primária duplicada
      return res.status(400).json({ error: 'Membro já está no grupo' });
    }

    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
};


const removeMember = async (req, res) => {
  const { email, id } = req.body;

  if (!email || !id) {
    console.log('Dados incompletos:', { email: !!email, id: !!id });
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

module.exports = {
    updateGroup,
    getGrupos,
    createGrupo,
    addMember,
    removeMember,
    getMembers
};