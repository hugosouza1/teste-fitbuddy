const { pool } = require('../../database/pool')

const friendshipNotifications = async (req, res) => {
  const email = req.params.email
  if(email === undefined || email.trim().length === 0) {
    return res.status(400).json({error: 'Email do usuário não foi informado.'})
  }
  let from = req.params.from;
  if(from === undefined || from.trim().length === 0) {
    from = new Date().toISOString()
  }
  let search = `
    SELECT friend.nome, friend.foto, friend.email, a.created_at AS data,
      CASE
        WHEN a.created_at > usuario.notificado THEN true
        ELSE false
      END AS nova_solicitacao
    FROM amigos a
    JOIN usuarios friend ON a.usuario1_email = friend.email
    JOIN usuarios usuario ON a.usuario2_email = usuario.email
    WHERE a.usuario2_email = $1 AND a.status='pendente' AND a.created_at < $2
    ORDER BY a.created_at DESC
    LIMIT 10;
  `;
  const params = [email, from]
  try {
    const result = await pool.query(search, params)
    return res.status(200).json(result.rows)
  } catch(err) {
    console.log(err)
    return res.status(500).json({error: 'Não foi possível recuperar as notificações'})
  }
}

const updateUserNotified = async (req, res) => {
  const email = req.params.email

  if(email === undefined || email.trim().length === 0) {
    return res.status(400).json({error: 'Email do usuário não informado.'})
  }

  let search = `UPDATE usuarios SET notificado = now() where email = $1`
  try{
    const result = pool.query(search, [email])
    return res.status(200).json({success: true})
  } catch (err) {
    console.log(err)
    return res.status(500).json({error: 'Erro ao atualizar notificado.'})
  }
}

module.exports = {
  friendshipNotifications,
  updateUserNotified,
}