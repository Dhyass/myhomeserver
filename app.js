import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";

import dotenv from 'dotenv'; // library to use .env file
dotenv.config();

const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials:true}))
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/posts", postRoute); // route for every function about post
app.use("/api/auth", authRoute); // authentification route
app.use("/api/test", testRoute);
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);


app.listen(PORT, () => {
    console.log(`Myhome backend is running on port ${PORT}`); // using port 6013 defined in .env file
  });
