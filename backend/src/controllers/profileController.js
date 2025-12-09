const { pool, getClient } = require('../../database/pool'); 
const bcrypt = require('bcrypt');
const { deleteUserPictures } = require('../service/pictureService.js');

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// ----------------- helpers de data -----------------

const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;


function toIsoDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseBrazilOrIsoDate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;

  // Date object
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(raw);
  }

  if (typeof raw !== 'string') return { error: 'Tipo de data inválido' };

  const s = raw.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const dt = new Date(`${s}T00:00:00Z`);
    if (Number.isNaN(dt.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(dt);
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split('/');
    const iso = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
    const dt = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(dt.getTime())) return { error: 'Data inválida' };
    return toIsoDateString(dt);
  }

  // ISO or other parseable
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return toIsoDateString(parsed);

  return { error: 'Formato de data não reconhecido. Use DD/MM/YYYY ou YYYY-MM-DD ou ISO.' };
}

const getUserProfile = async (req, res) => {
  const userEmail = req.params?.email ;
  if (!userEmail) {
    return res.status(400).json({ error: 'Email é obrigatório (params ou body).' });
  }

  try {
    // Agrega horários (se houver tabela horarios) e pega preferências
    const sql = `
        SELECT 
          u.email,
          u.academia,
          u.nome,
          TO_CHAR(u.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
          u.foto,
          u.descricao,
          u.created_at,
          p.gosto_musical,
          p.objetivo,
          p.experiencia,
          COALESCE(
            json_agg(DISTINCT TO_CHAR(h.horario, 'HH24:MI') ORDER BY TO_CHAR(h.horario, 'HH24:MI')) 
            FILTER (WHERE h.horario IS NOT NULL),
            '[]'
          ) AS horarios
        FROM usuarios u
        LEFT JOIN preferencias p ON p.email = u.email
        LEFT JOIN horarios h ON h.email = u.email
        WHERE u.email = $1
        GROUP BY u.email, u.nome, u.data_nascimento, u.foto, u.descricao, u.created_at, p.gosto_musical, p.objetivo, p.experiencia;
      `;

      const sql2 = `
        SELECT 
          a.id,
          a.cidade,
          a.logradouro,
          a.nome
        FROM academia a 
        WHERE a.id = $1
      `;

    const result = await pool.query(sql, [userEmail]);
    
    if (result.rows.length === 0) {
      console.log(`[GET profile] ${userEmail} não encontrado`);
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    const row = result.rows[0];
    
    const academiaId = row.academia ?? null;

    let academiaObj = null;
    if (academiaId) {
      try {
        const result2 = await pool.query(sql2, [academiaId]);
        academiaObj = result2.rows[0] || null;
        console.log('[GET profile] academia encontrada:', academiaObj);
      } catch (err2) {
        console.error('[GET profile] erro ao buscar academia id=', academiaId, err2);
        // não quebrar o endpoint só por problema da academia: mantemos academia = null
        academiaObj = null;
      }
    } else {
      console.log('[GET profile] usuário não tem academia cadastrada (academia id = null)');
    }

    row.academia = academiaObj; // anexa null ou objeto
    console.log('[GET profile] Row completo:', JSON.stringify(row, null, 2));
    
    // row.horarios já é um array de strings (mesmo que vazio)
    res.status(200).json(row);
  } catch (err) {
    console.error(`[GET profile] erro ao buscar perfil ${userEmail}:`, err);
    if (err.code === '42703') {
      // coluna não existe
      return res.status(500).json({ error: `Coluna inexistente: ${err.message.split('"')[1]}` });
    }
    return res.status(500).json({ error: 'Erro interno ao buscar perfil' });
  }
};


const updateUserProfile = async (req, res) => {
  const body = req.body;
  const email = body?.email;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Campo "email" obrigatório.' });
  }

  const usuariosAllowed = ['nome', 'data_nascimento', 'foto', 'descricao', 'academia'];
  const preferenciasAllowed = ['gosto_musical', 'objetivo', 'experiencia'];

  // Normalize updates (usuarios)
  const usuariosUpdate = {};

  for (const k of usuariosAllowed) {
    if (Object.hasOwn(body, k)) {
      if (k === 'data_nascimento') {
        const raw = body.data_nascimento ?? body.birthDate ?? body.data_nascimento;
        if (raw === null || raw === undefined || raw === '') {
          usuariosUpdate.data_nascimento = null;
        } else {
          const parsed = parseBrazilOrIsoDate(raw);
          if (parsed && parsed.error) {
            return res.status(400).json({ error: `Campo "data_nascimento" inválido: ${parsed.error}` });
          }
          usuariosUpdate.data_nascimento = parsed;
        }
      } else {
        if (k === 'academia') {
          usuariosUpdate[k] = body[k] === null ? null : Number(body[k]);
        } else {
          usuariosUpdate[k] = body[k] === null ? null : String(body[k]);
        }
      }

    }
  }

  const preferenciasUpdate = {};
  for (const k of preferenciasAllowed) {
    if (Object.hasOwn(body, k)) {
      preferenciasUpdate[k] = body[k] === null ? null : String(body[k]);
    }
  }

  let horariosArr = null;
  if (Object.hasOwn(body, 'horario') || Object.hasOwn(body, 'horarios')) {
    const raw = body.horario ?? body.horarios;
    if (raw === null) {
      horariosArr = []; // limpar todos
    } else if (Array.isArray(raw)) {
      horariosArr = raw.map(String).map(s => s.trim()).filter(Boolean);
    } else if (typeof raw === 'string') {
      const t = raw.trim();
      horariosArr = t === '' ? [] : (t.includes(',') ? t.split(',').map(s => s.trim()).filter(Boolean) : [t]);
    } else {
      return res.status(400).json({ error: 'Campo "horario" deve ser array, string (CSV) ou null.' });
    }

    // validar HH:MM
    const bad = horariosArr.find(h => !timeRegex.test(String(h).trim()));
    if (bad) return res.status(400).json({ error: `Formato inválido em horario: ${bad}. Use HH:MM` });


    horariosArr = Array.from(new Set(horariosArr)).sort();
  }

  if (Object.keys(usuariosUpdate).length === 0 && Object.keys(preferenciasUpdate).length === 0 && horariosArr === null) {
    return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1) Atualiza usuarios se houver
    if (Object.keys(usuariosUpdate).length > 0) {
      const parts = [];
      const vals = [];
      let idx = 1;
      for (const [col, val] of Object.entries(usuariosUpdate)) {
        parts.push(`${col} = $${idx++}`);
        vals.push(val);
      }
      vals.push(email);
      const sql = `UPDATE usuarios SET ${parts.join(', ')} WHERE email = $${vals.length} RETURNING *;`;
      const r = await client.query(sql, vals);
      if (r.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
    }

    // 2) Upsert preferencias se houver
    if (Object.keys(preferenciasUpdate).length > 0) {
      const cols = ['email', ...Object.keys(preferenciasUpdate)];
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const updateAssign = Object.keys(preferenciasUpdate).map(k => `${k} = EXCLUDED.${k}`).join(', ');
      const values = [email, ...Object.values(preferenciasUpdate)];
      const insertSql = `
        INSERT INTO preferencias (${cols.join(',')})
        VALUES (${placeholders})
        ON CONFLICT (email) DO UPDATE SET ${updateAssign};
      `;
      await client.query(insertSql, values);
    }

    // 3) Sincroniza tabela horarios se foi fornecido (null->limpar, []->apagar, array->substituir)
    if (horariosArr !== null) {
      await client.query('DELETE FROM horarios WHERE email = $1;', [email]);
      if (horariosArr.length > 0) {
        const insertSql = 'INSERT INTO horarios (email, horario) VALUES ($1, $2) ON CONFLICT DO NOTHING;';
        for (const h of horariosArr) {
          await client.query(insertSql, [email, h]); 
        }
      }
    }

    await client.query('COMMIT');

    // 4) Buscar perfil final e retornar (inclui data_nascimento e horarios)
    const finalSql = `
      SELECT
        u.email, u.academia, u.nome, u.foto, u.descricao, TO_CHAR(u.data_nascimento,'YYYY-MM-DD') AS data_nascimento, u.notificado, u.created_at,
        p.gosto_musical, p.objetivo, p.experiencia,
        COALESCE(json_agg(TO_CHAR(h.horario,'HH24:MI') ORDER BY h.horario) FILTER (WHERE h.horario IS NOT NULL), '[]') AS horarios
      FROM usuarios u
      LEFT JOIN preferencias p ON u.email = p.email
      LEFT JOIN horarios h ON u.email = h.email
      WHERE u.email = $1
      GROUP BY u.email, u.nome, u.foto, u.descricao, u.data_nascimento, u.notificado, u.created_at, p.gosto_musical, p.objetivo, p.experiencia;
    `;
    const finalRes = await pool.query(finalSql, [email]);
    const profile = finalRes.rows[0] || null;
    return res.status(200).json(profile);
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (e) { console.error('Rollback falhou', e); }
    }
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.', detail: err.message || String(err) });
  } finally {
    if (client) client.release();
  }
};



const createUser = async (req, res) => {
    console.log('[POST /api/register] Recebida requisição de registro:', req.body)
    const { name, email, password } = req.body

    if(!name || !email || !password){
        console.warn('[POST /api/register] Dados incompletos:', { name: !!name, email: !!email, password: !!password })
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
    }
    
    if(typeof name !== 'string' || name.trim() === '' || 
    typeof email !== 'string' || email.trim() === '' || typeof password 
    !== 'string' || password.length < 1){
        console.warn('[POST /api/register] Dados inválidos:', { name, email, passwordLength: password.length })
        return res.status(400).json({ error: 'Dados inválidos. Verifique nome, email e senha (mínimo 1 caracteres).' })
    }
    
    let client 
    try{
        client = await pool.connect() // duas operações na mesma conexão. o rollback pega as duas
        await client.query('BEGIN')
        
        const insertUserSql = 'INSERT INTO usuarios (email, nome, created_at) VALUES ($1, $2, now()) RETURNING email, nome, created_at'
        const userRes = await client.query(insertUserSql, [email, name])
        
        const hashed = await hashPassword(password)
        const insertCredSql = 'INSERT INTO credenciais (email, password) VALUES ($1, $2)' 
        await client.query(insertCredSql, [email, hashed])
        
        await client.query('COMMIT')
        res.status(201).json(userRes.rows[0])
        
    }catch(err){
        if(client){
            await client.query('ROLLBACK') 
            console.error('[POST /api/register] Rollback da transação devido a erro.')
        }
        console.error('[POST /api/register] Erro ao criar usuário:', err)
        
        
        if(err.code === '23505'){ 
            if(err.constraint && err.constraint.includes('usuarios_pkey')){
                console.warn(`[POST /api/register] Email ${email} já cadastrado na tabela usuarios.`)
                return res.status(409).json({ error: 'Email já cadastrado.' }) 
            }
            if(err.constraint && err.constraint.includes('credenciais_pkey')){
                console.warn(`[POST /api/register] Email ${email} já cadastrado na tabela credenciais (Inconsistência?).`)
                return res.status(409).json({ error: 'Email já cadastrado (credenciais).' }) 
            }
            console.warn(`[POST /api/register] Violação de chave única não especificada para email ${email}.`)
            return res.status(409).json({ error: 'Este email já está em uso.' }) 
        }

        return res.status(500).json({ error: 'Erro interno ao criar usuário' })

    }finally{
        if (client){
            client.release() 
        }
    }
}


const getCredenciais = async (req, res) => {
    console.log('Recebida requisição de login:', req.body)
    const { email, password } = req.body
    
    if (!email || !password) {
      console.log('Dados incompletos:', { email: !!email, password: !!password })
        return res.status(400).json({ error: 'Dados incompletos' })
      }
      
      try {
        const sql = 'SELECT password FROM credenciais WHERE email = $1'
        const result = await pool.query(sql, [email])
        
        if (result.rows.length === 0) {
          console.log('Usuário não encontrado:', email)
          return res.status(401).json({ error: 'Credenciais inválidas' })
        }
        
        const hash = result.rows[0].password
        
        // Comparar a senha informada com o hash
        const match = await bcrypt.compare(password, hash)
        if (!match) {
          console.log('Senha incorreta para o email:', email)
          return res.status(401).json({ error: 'Credenciais inválidas' })
        }
        
        console.log('Login bem-sucedido para:', email)
        return res.status(200).json({ message: 'Login realizado com sucesso', email })
      } catch (err) {
          console.error('Erro ao verificar credenciais:', err)
          return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  };
  
  
const deleteProfile = async (req, res) => {
  console.log('Recebida requisição de delete:', { params: req.params });

  const email = req.params.email ;

  if (!email) {
    console.log('Dados incompletos: email ausente');
    return res.status(400).json({ error: 'Email ausente' });
  }

  const cliente = await getClient();

  try {
    await cliente.query('BEGIN');
    
    const sqlDelete = 'DELETE FROM usuarios WHERE email = $1';
    const result = await cliente.query(sqlDelete, [email]);
    
    await cliente.query('COMMIT');

    if (result.rowCount === 0) {
      console.log('Nenhum usuário apagado — email não encontrado:', email);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await deleteUserPictures(email);
    
    console.log('Conta apagada:', email);
    return res.status(200).json({ message: 'Conta apagada com sucesso', email });

  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error('Erro ao apagar conta:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    try { cliente.release(); } catch (e) {}
  }
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    createUser,
    getCredenciais,
    deleteProfile
};
