import jwt from "jsonwebtoken";


export const ShouldBeLoggedIn = async (req, res)=>{
    console.log(req.userId);
   res.status(200).json({message:"Vous êtes authentifiés"});
}

export const ShouldBeAdmin = async (req, res)=>{

    const token =req.cookies.token;

    if(!token){
        return res.status(401).json({message:"Vous n'Etes pas authentifiés"});
    }

    jwt.verify(token,process.env.JWT_SECRET_KEY, async (error, payload)=>{
        if (error) {
            return res.status(403).json({message:"Authetification Expirée"});
        }

        if (!payload.isAdmin) {
            return res.status(403).json({message:"Non autorisé"});
        }
    })

   res.status(200).json({message:"Vous êtes authentifiés"});
    
}