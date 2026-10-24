const jwt = require('jsonwebtoken');
require('dotenv').config();


const auth = (req, res, next) => {
const token = req.headers['authorization']?.split(' ')[1]; 
if (!token) {
    return res.status(400).json({ message: 'Token not provided' });
  }
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  
  if(err){
    console.log(err);
    res.status(500).json(err);
  } else{
    req.user = decoded;
    next();
  }
})
};

module.exports = auth;