const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=> {
   try {
       let token = req.headers.authorization;
     
       if(token ==''){
           res.status(404).json({Message:"// please enter token "})
       }else{
           let decoded = jwt.verify(token,process.env.SECRET_KEY);
           req.data = decoded;
   
           next();
       }
   
       
   } catch (err) {
       res.status(401).json({Message:"Invalid Token",error:err})
   }
}