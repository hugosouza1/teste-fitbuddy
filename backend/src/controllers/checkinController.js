const { getClient, pool } = require('../../database/pool');

const getCheckinToday = async (req, res) => {
  const email = req.params.email

  if(!email || email.trim().length === 0) {
    return res.status(400).json({error: 'Deve ser fornecido um campo de email válido.'})
  }

  const query = `
    SELECT EXISTS (
      SELECT 1
      FROM checkin
      WHERE email = $1 AND dia = CURRENT_DATE
    ) as checkin_hoje
  `
  try {
    const result = await pool.query(query, [email])
    return res.status(200).json(result.rows[0])
  } catch(err) {
    console.log(err)
    return res.status(500).json({error: 'Ocorreu um erro ao verificar o check-in de hoje.'})
  }

}

const registerCheckin = async (req, res) => {
  const {email, fotoURL} = req.body

  if(!email || email.trim().length === 0) {
    return res.status(400).json({error: 'Deve ser fornecido um campo de email válido.'})
  }

  if(!fotoURL || fotoURL.trim().length === 0) {
    return res.status(400).json({error: 'Deve ser fornecido um campo de email válido.'})
  }

  const query = `
    INSERT INTO checkin (email, dia, fotoURL)
    VALUES ($1, CURRENT_DATE, $2)
  `
  try {
    await pool.query('BEGIN')
    await pool.query(query, [email, fotoURL])
    await pool.query('COMMIT')

    return res.status(201).json({sucess: true})
  } catch(err) {
    await pool.query('ROLLBACK')
    console.log(err)
    
    return res.status(500).json({error: 'Ocorreu um erro ao registra o checkin.'})
  }
}

module.exports = {
  getCheckinToday,
  registerCheckin
};
