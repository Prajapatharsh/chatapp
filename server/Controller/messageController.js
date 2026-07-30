const Message = require("../models/Messages.js")
const User = require("../models/User.js")
const { uploadImageToCloudinary } = require("../config/imageUploader.js")
const { io, userSocketMap } = require("../index.js")

exports.getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")

        const unseenMessages = {}

        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })

        await Promise.all(promises)

        const normalizedUsers = filteredUsers.map(user => {
            const u = user.toObject ? user.toObject() : user;
            u.fullName = u.fullname || u.fullName || "";
            u.profilePic = u.profilepic || u.profilePic || "";
            return u;
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users: normalizedUsers,
            unseenMessages
        })


    }
    catch (err) {
        console.error("Error fetching users for sidebar:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching users for sidebar"
        })
    }
}

exports.getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id || req.user.id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId },
            { seen: true }
        )

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages
        })
    }
    catch (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching messages"
        })
    }
}

exports.markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true }, { new: true })

        return res.status(200).json({
            success: true,
            message: "Message marked as seen"
        })
    }
    catch (err) {
        console.error("Error marking message as seen:", err);
        return res.status(500).json({
            success: false,
            message: "Error marking message as seen"
        })
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const senderId = req.user._id || req.user.id;
        const receiverId = req.params.id || req.params._id;

        let imageUrl = null;
        if (image) {
            const uploadResponse = await uploadImageToCloudinary(image, process.env.FOLDER_NAME)
            imageUrl = uploadResponse ? uploadResponse.secure_url : null;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        const receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            newMessage
        })
    }
    catch (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({
            success: false,
            message: "Error sending message"
        })
    }
}