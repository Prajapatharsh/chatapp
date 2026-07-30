const express = require("express")
const router = express.Router()

const { signup, login, updateProfile, checkAuth } = require("../Controller/userController")
const { auth } = require("../middleware/auth")

router.post("/signup", signup)
router.post("/login", login)
router.put("/update-profile", auth, updateProfile)
router.get("/check-auth", auth, checkAuth)
router.get("/check", auth, checkAuth)

module.exports = router