import express from "express";
import { ShouldBeAdmin, ShouldBeLoggedIn } from "../controllers/testController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/logged_in", verifyToken, ShouldBeLoggedIn);

router.get("/admin", ShouldBeAdmin);



export default router;