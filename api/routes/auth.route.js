const express = require("express");
const { register, login, logout, verifyEmail, resendVerificationEmail } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/verify-email", verifyEmail)
router.post("/resend-verification", resendVerificationEmail)

module.exports = router;