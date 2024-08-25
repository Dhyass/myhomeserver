// routes/userRoutes.js
import express from "express";
import {
    addUser // Import the addUser controller
    ,

    deleteUser,
    getNotificationNumber,
    getUser,
    getUsers,
    profilePosts,
    savePost,
    updateUser
} from "../controllers/userController.js";
import { checkRole } from "../middleware/checkRole.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, checkRole('Admin'), getUsers); // Only admins can get all users

router.get("/search/:id", verifyToken, getUser);

router.put("/:id", verifyToken, updateUser); 

router.delete("/delete/:id", verifyToken, checkRole('Admin'), deleteUser); // Only admins can delete users

router.post('/save', verifyToken, savePost);

router.get("/profilePosts", verifyToken, profilePosts); // User profile posts

router.get("/notification", verifyToken, getNotificationNumber); 

router.post("/add", verifyToken, checkRole('Admin'), addUser); // Only admins can add users

export default router;
