var jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required')
}

const fetchuser = async (req,res,next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authentivate using a valid token"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({error:"Please authentivate using a valid token"})
    }
}

module.exports = fetchuser
