import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chats = await prisma.chat.findMany({
            where: {
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
        });

        for (const chat of chats) {
            const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
            if (receiverId) {
                const receiver = await prisma.user.findUnique({
                    where: {
                        id: receiverId,
                    },
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                });
                chat.receiver = receiver;
            } else {
                chat.receiver = null;
            }
        }

        res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get chats" });
    }
};

export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        // Vérifiez si le chat existe
        if (!chat || !chat.userIDs.includes(tokenUserId)) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await prisma.chat.update({
            where: {
                id: req.params.id,
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            },
        });

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get chat" });
    }
};



export const addChat = async (req, res) => {
    const tokenUserId = req.userId;
    const postId = req.body.postId;

    try {
        // Récupérer le post pour obtenir l'ID de l'utilisateur
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const receiverId = post.userId;

        // Vérifiez si le chat existe déjà
        let chat = await prisma.chat.findFirst({
            where: {
                postId,
                userIDs: {
                    hasEvery: [tokenUserId, receiverId],
                },
            },
        });

        // Si le chat n'existe pas, créez-le
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    postId,
                    userIDs: [tokenUserId, receiverId],
                },
            });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add chat" });
    }
};

  

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
            },
        });

        // Vérifiez si le chat existe
        if (!chat || !chat.userIDs.includes(tokenUserId)) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const updateChat = await prisma.chat.update({
            where: {
                id: req.params.id,
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            },
        });
        res.status(200).json(updateChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to read chat" });
    }
};



export const getOrCreateChat = async (req, res) => {
    const { postId } = req.body;
    const tokenUserId = req.userId;

    try {
        // Récupérer le post pour obtenir l'ID de l'utilisateur
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const receiverId = post.userId; // le message will be send to the post owner

        // Rechercher le chat existant
        let chat = await prisma.chat.findFirst({
            where: {
                userIDs: {
                    hasEvery: [tokenUserId, receiverId],
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        // Si le chat n'existe pas, créez-le
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    userIDs: [tokenUserId, receiverId],
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get or create chat" });
    }
};


