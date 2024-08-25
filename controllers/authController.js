import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
    const { username, email, telephone, password, role } = req.body;
    // Hash the password
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user and save to DB
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                telephone,
                password: hashedPassword,
                role: role || 'Utilisateur', // Default to CLIENT if no role is provided
            },
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create user!" });
    }
}


export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const age = 1000 * 60 * 60 * 24 * 7; // for seven days

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role, // Include role in the token
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: age }
        );

        const { password: userPassword, ...userInfo } = user;
        userInfo.token= token;

        res.status(200).json(userInfo);
/*
        res.cookie("token", token, {
            httpOnly: true,
           // secure: true, // for production mode
            maxAge: age, // expiry time
        }).status(200).json(userInfo);
*/
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to login!" });
    }
}

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout successfully" });
}

