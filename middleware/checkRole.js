// middleware/checkRole.js

import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const checkRole = (role) => {
    return async (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Vous n'êtes pas authentifiés" });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, payload) => {
            if (error) {
                return res.status(403).json({ message: "Authentification expirée" });
            }

            const user = await prisma.user.findUnique({ where: { id: payload.id } });

            if (user.role !== role) {
                return res.status(403).json({ message: "Non autorisé" });
            }

            req.userId = payload.id;
            req.userRole = user.role;

            next();
        });
    };
};
