const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { dbConnect } = require("./config/database")
const { cloudinaryConnect } = require("./config/cloudinary")
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

exports.io = io

const userSocketMap = {}
exports.userSocketMap = userSocketMap

const userRouter = require("./routes/userRoutes")
const messageRouter = require("./routes/messagesRoutes")

io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected",userId);

    if(userId){
        userSocketMap[userId]=socket.id;
    }

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

app.use(express.json({limit:"4mb"}));
app.use(cors())

app.get("/",(req,res)=>{
    res.send("Server is running")
})

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/status", (req, res) => res.send("Server is live"));

app.use("/api/auth", userRouter)
app.use("/auth", userRouter)

app.use("/api/messages", messageRouter)
app.use("/messages", messageRouter)


dbConnect();
cloudinaryConnect();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(
      `Server is running on PORT: ${PORT} => http://localhost:${PORT}/api/status`
    )
  );
}

module.exports = server;