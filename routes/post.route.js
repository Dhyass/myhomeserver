import express from "express";
import { addPost, deletePost, getDetailedPosts, getPost, getPosts, updatePost } from "../controllers/postController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/', getPosts);
router.get('/post/:id', getPost);
router.post('/',verifyToken, addPost);
router.put('/:id',verifyToken, updatePost);
router.delete('/:id',verifyToken, deletePost);
router.get("/admin", verifyToken, getDetailedPosts ); // Only admins can get all users


export default router;

// routes/postRoutes.js

