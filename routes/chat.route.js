import express from "express";
import { addChat, getChat, getChats, getOrCreateChat, readChat } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();


router.get("/", verifyToken, getChats);

router.get("/:id", verifyToken, getChat);

router.post('/',verifyToken, addChat);

router.post('/getOrCreate', verifyToken, getOrCreateChat);

router.put('/read/:id',verifyToken, readChat);

export default router;