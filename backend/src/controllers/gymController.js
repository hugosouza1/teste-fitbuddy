const { pool } = require('../../database/pool')

const searchGym = async (req, res) => {
  const name = req.params.name
  if(name === undefined || name.trim().length === 0) {
    res.status(400).json({error: 'Nenhum nome especificado para realizar a pesquisa.'})
  }
  let search = 'SELECT * FROM academia WHERE nome ILIKE $1'
  const params = [`%${name}%`]
  const city = req.query.city;
  console.log(city)
  if(city !== undefined && city.trim().length > 0) {
    search += ' AND cidade ILIKE $2'
    params.push(`%${city}%`)
  }
  try {
    const result = await pool.query(search, params)
    if(result.rows.length > 0) {
      res.status(200).json(result.rows)
    } else {
      res.status(404).json({error: 'Nenhuma academia encontrada.'})
    }
  } catch(err) {
    console.log(err)
    res.status(500).json({error: 'Não foi possível buscar academias.'})
  }
}

const createGym = async (req, res) => {
  const {name, address, city} = req.body;
  if(!name || !address || !city) {
    res.status(400).json({error: 'Dados incompletos'})
    return
  }

  try {
    const insert = 'INSERT INTO academia (nome, logradouro, cidade) VALUES ($1, $2, $3) RETURNING nome, logradouro, cidade'
    const userRes = await pool.query(insert, [name, address, city])
    res.status(201).json(userRes.rows[0])
  } catch(err) {
    if(err.code === '23505') {
      res.status(400).json({ error: 'Já existe uma academia cadastrada com este endereço.'})
    } else {
      res.status(500).json({error: 'Não foi possível criar uma nova academia.'})
    }
  }
}

module.exports = {
  searchGym,
  createGym
}