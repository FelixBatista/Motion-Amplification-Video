const jwt = require('jsonwebtoken')
const User = require('../model/userSchema')

const Authenticate = async(req,res,next) =>{
    try{
        const token = req.cookies.jwtoken
        
        if(!token){
            return res.status(401).json({error: "Unauthorized: No token provided"})
        }
        
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY || process.env.JWT_SECRET || 'default-secret-key')
        const rootUser = await User.findOne({_id:verifyToken._id,"tokens.token":token})

        if(!rootUser){
            return res.status(401).json({error: "Unauthorized: User not found"})
        }
        
        req.token = token
        req.rootUser = rootUser
        next()
    }
    catch(err){
        if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'){
            return res.status(401).json({error: "Unauthorized: Invalid or expired token"})
        }
        res.status(401).json({error: "Unauthorized: Authentication failed"})
        console.log(err)
    }
}

module.exports = Authenticate