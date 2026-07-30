const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { uploadImageToCloudinary } = require("../config/imageUploader")

exports.signup = async (req, res) => {
    try {
        const { fullname, fullName, email, password, bio } = req.body
        const userName = fullname || fullName

        if (!userName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            })
        }

        const existinguser = await User.findOne({ email })
        if (existinguser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedpassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            fullname: userName,
            email,
            password: hashedpassword,
            bio
        })

        const token = jwt.sign(
            { _id: newUser._id, id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        newUser.password = undefined

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            userData: newUser,
            token
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error in signup",
            error: err.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password, passowrd } = req.body
        const userPassword = password || passowrd

        if (!email || !userPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (await bcrypt.compare(userPassword, user.password)) {
            const token = jwt.sign(
                { _id: user._id, id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            )

            user.password = undefined

            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                user,
                userData: user,
                token
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error in login",
            error: err.message
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullname, fullName } = req.body
        const userId = req.user._id || req.user.id
        const userName = fullname || fullName

        let updatedUser

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullname: userName },
                { new: true }
            ).select("-password")
        }
        else {
            const upload = await uploadImageToCloudinary(profilePic, process.env.FOLDER_NAME)
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilepic: upload.secure_url, profilePic: upload.secure_url, bio, fullname: userName },
                { new: true }
            ).select("-password")
        }

        let userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
        userObj.profilePic = userObj.profilepic || userObj.profilePic || "";
        userObj.fullName = userObj.fullname || userObj.fullName || "";

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userObj,
            updatedUser: userObj
        })

    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error in updating profile",
            error: err.message
        })
    }
}

exports.checkAuth = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        let userObj = user.toObject ? user.toObject() : user;
        userObj.fullName = userObj.fullname || userObj.fullName || "";
        userObj.profilePic = userObj.profilepic || userObj.profilePic || "";

        res.json({
            success: true,
            user: userObj
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error in check auth",
            error: err.message
        })
    }
}