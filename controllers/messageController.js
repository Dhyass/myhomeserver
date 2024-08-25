import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
    const tokenUserId = req.userId;
    const chatId = req.params.chatId;
    const text = req.body.text;
    
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
        });

        if (!chat || !chat.userIDs.includes(tokenUserId)) {
            return res.status(404).json({ message: "Chat not found!" });
        }

        const message = await prisma.message.create({
            data: {
                text,
                chatId,
                userId: tokenUserId,
            },
        });

        await prisma.chat.update({
            where: {
                id: chatId,
            },
            data: {
                seenBy: { set: [tokenUserId] }, // using set to ensure it's an array
                lastMessage: text,
            },
        });

        res.status(200).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add message" });
    }
};
