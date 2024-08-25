// middleware/verifyToken.js
import jwt from "jsonwebtoken";
import { getTokenFromHeader } from "./tokenFromHeader.js";



export const verifyToken = (req, res, next) => {
   // const token = req.cookies.token;
  /* const authHeader = req.headers['authorization'];
   const token = authHeader;*/

   //console.log("authHeader :", authHeader);
   //console.log("token :", token);
   const token=getTokenFromHeader(req);

    if (!token) {
        return res.status(401).json({ message: "Vous n'êtes pas authentifiés" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, payload) => {
        if (error) {
            return res.status(403).json({ message: "Authentification expirée" });
        }

        req.userId = payload.id;
        req.userRole = payload.role; // Set the role from the payload

        next();
    });
};
