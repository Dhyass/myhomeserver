// controllers/userController.js

import bcrypt from 'bcrypt';
import prisma from "../lib/prisma.js";

export const getUsers = async (req, res) => {
    const { role } = req.query;

    try {
        const filters = {};
        if (role) {
            filters.role = role;
        }

        const users = await prisma.user.findMany({
            where: filters,
        });

       // console.log(users);

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get users" });
    }
};


export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const posts = await prisma.post.findMany({ where: { userId: id } });
        res.status(200).json({ user, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get user" });
    }
};

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const { password, avatar, ...inputs } = req.body;

    if (id !== tokenUserId && req.userRole !== 'Admin') {
        return res.status(403).json({ message: "Non Autorisé" });
    }

    try {
        let updatedPassword = null;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...inputs,
                ...(updatedPassword && { password: updatedPassword }),
                ...(avatar && { avatar }),
            },
        });

        const { password: userPassword, ...rest } = updatedUser;
        res.status(200).json(rest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update user" });
    }
};

export const deleteUser = async (req, res) => {
    const id = req.params.id;

    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: "Non Autorisé" });
    }

    try {
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};


// Save a post
export const savePost = async (req, res) => {
    const postId = req.body.postId;
    const tokenUserId = req.userId;

    try {
        const savedPost = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: tokenUserId,
                    postId,
                },
            },
        });

        if (savedPost) {
            await prisma.savedPost.delete({
                where: {
                    id: savedPost.id,
                },
            });
            res.status(200).json({ message: "Post removed from saved list" });
        } else {
            await prisma.savedPost.create({
                data: {
                    userId: tokenUserId,
                    postId,
                },
            });
            res.status(200).json({ message: "Post saved" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save post" });
    }
};
// Get profile posts
export const profilePosts = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const userPosts = await prisma.post.findMany({ where: { userId: tokenUserId } });

        const savedPosts = await prisma.savedPost.findMany({ where: { userId: tokenUserId } });

        const postIds = savedPosts.map((savedPost) => savedPost.postId);
        const relatedPosts = await prisma.post.findMany({ where: { id: { in: postIds } } });

        const savedPostsWithDetails = savedPosts.map((savedPost) => {
            const post = relatedPosts.find((post) => post.id === savedPost.postId);
            return post ? { ...savedPost, post } : null;
        }).filter(item => item !== null);

        res.status(200).json({
            userPosts,
            savedPosts: savedPostsWithDetails.map(item => item.post),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get profile posts" });
    }
};

// Get notification number
export const getNotificationNumber = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const number = await prisma.chat.count({
            where: {
                userIDs: {
                    hasSome: [tokenUserId],
                },
                NOT: {
                    seenBy: {
                        hasSome: [tokenUserId],
                    },
                },
            },
        });
        res.status(200).json(number);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get profile posts" });
    }
};

// Add a new user by an Admin
export const addUser = async (req, res) => {
    const { username, email, telephone, password, role } = req.body;

    // Only allow Admin to add users
    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: "Non Autorisé" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user and save to DB
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                telephone,
                password: hashedPassword,
                role: role || 'Utilisateur', // Default to Utilisateur if no role is provided
            },
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create user!" });
    }
};

