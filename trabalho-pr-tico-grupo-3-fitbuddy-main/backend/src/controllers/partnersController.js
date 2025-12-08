const { pool } = require('../../database/pool'); 

const addPartner = async (req, res) => {
    const userEmail = req.body.userEmail;
    const partnerEmail = req.body.partnerEmail;

    if(userEmail === undefined || userEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do usuário não especificado.'})
    }

    if(partnerEmail === undefined || partnerEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do parceiro não especificado.'})
    }

    const query = `
        INSERT INTO amigos (usuario1_email, usuario2_email, created_at) VALUES ($1, $2, now()) 
    `
    try{
        await pool.query('BEGIN')
        const queryRes = await pool.query(query, [userEmail, partnerEmail])
        await pool.query('COMMIT')
        return res.status(201).json({sucess: true})

    } catch(err) {
        await pool.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({error: 'Falha ao criar solitação.'})
    }
}

const deleteFriendship = async (req, res) => {
    const userEmail = req.body.userEmail;
    const partnerEmail = req.body.partnerEmail;

    if(userEmail === undefined || userEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do usuário não especificado.'})
    }

    if(partnerEmail === undefined || partnerEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do parceiro não especificado.'})
    }
    const query = `DELETE FROM amigos WHERE (usuario1_email = $1 AND usuario2_email = $2) OR (usuario1_email = $2 AND usuario2_email = $1)`
    try {
        await pool.query('BEGIN')
        await pool.query(query, [userEmail, partnerEmail])
        await pool.query('COMMIT')
        return res.status(200).json({success: true})
    } catch(err) {
        await pool.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({error: 'Ocorreu um erro ao desfazer amizade.'})
    }
}

const acceptFriendship = async (req, res) => {
    const userEmail = req.body.userEmail;
    const partnerEmail = req.body.partnerEmail;

    if(userEmail === undefined || userEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do usuário não especificado.'})
    }

    if(partnerEmail === undefined || partnerEmail.trim().length === 0) {
        return res.status(400).json({error: 'Email do parceiro não especificado.'})
    }

    const query = `UPDATE amigos SET status = \'aceito\' WHERE (usuario1_email = $1 AND usuario2_email = $2) OR (usuario1_email = $2 AND usuario2_email = $1)`
    try {
        await pool.query('BEGIN')
        await pool.query(query, [userEmail, partnerEmail])
        await pool.query('COMMIT')
        return res.status(200).json({success: true})
    } catch(err) {
        await pool.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({error: 'Ocorreu um erro ao aceitar a solicitação de amizade.'})
    }
}

const getPartnerSuggestions = async (req, res) => {
    const email = req.params.email

    if(email === undefined || email.trim().length < 0) {
        return res.status(400).json({error: 'Email de usuário não especificado.'})
    }

    try {
        const query = `
            SELECT parceiro.email, parceiro.nome, parceiro.foto
            FROM usuarios u JOIN academia a1 ON u.academia = a1.id
            JOIN usuarios parceiro ON parceiro.academia IN (
                SELECT a.id FROM academia a WHERE a.cidade = a1.cidade
            )
            LEFT OUTER JOIN amigos ON ((usuario1_email = u.email AND usuario2_email = parceiro.email)
                                        OR (usuario1_email = parceiro.email AND usuario2_email = u.email))
            WHERE u.email = $1 AND parceiro.email != u.email AND amigos.id IS NULL
            LIMIT 20;
        `
        
        const result = await pool.query(query, [email])
        if(result.rows.length > 0) {
            return res.status(200).json(result.rows)
        } else {
            return res.status(404).json({error: 'Nenhuma recomendação encontrada.'})
        }

    } catch (error) {
        console.error('Erro ao buscar sugestões de parceiros:', error)
        res.status(500).json({ error: 'Falha interna ao processar sugestões.' })
    }
}

module.exports = {
    getPartnerSuggestions,
    addPartner,
    deleteFriendship,
    acceptFriendship
};
