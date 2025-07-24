const { User } = require("../models/index.js");
const createError = require("../utils/createError.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../utils/emailService.js");

const register = async (req, res, next) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 5);
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      ...req.body,
      password: hash,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      newUser.email,
      newUser.username,
      verificationToken
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails, just log it
    }

    const { password, emailVerificationToken, ...userInfo } = newUser.dataValues;
    res.status(201).json({ 
      message: "User has been created. Please check your email to verify your account.", 
      user: userInfo,
      emailSent: emailResult.success
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(createError(409, "Email already exists!"));
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) return next(createError(400, "Wrong password or email!"));

    // Check if email is verified
    if (!user.isEmailVerified) {
      return next(createError(403, "Please verify your email address before logging in. Check your email for verification link."));
    }

    const token = jwt.sign(
      {
        id: user.id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );

    const { password, emailVerificationToken, ...info } = user.dataValues;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      expires: new Date(0),
    })
    .status(200)
    .send("User has been logged out.");
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return next(createError(400, "Invalid verification link. Token and email are required."));
    }

    const user = await User.findOne({
      where: { 
        email: decodeURIComponent(email),
        emailVerificationToken: token
      }
    });

    if (!user) {
      return next(createError(400, "Invalid verification token or email."));
    }

    // Check if token has expired
    if (new Date() > user.emailVerificationExpires) {
      return next(createError(400, "Verification token has expired. Please request a new verification email."));
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({
        message: "Email is already verified. You can now log in.",
        alreadyVerified: true
      });
    }

    // Update user verification status
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      message: "Email verified successfully! You can now log in to your account.",
      verified: true
    });
  } catch (err) {
    next(err);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, "Email is required."));
    }

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return next(createError(404, "User not found with this email address."));
    }

    if (user.isEmailVerified) {
      return next(createError(400, "Email is already verified."));
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken
    );

    if (!emailResult.success) {
      return next(createError(500, "Failed to send verification email. Please try again later."));
    }

    res.status(200).json({
      message: "Verification email sent successfully. Please check your email.",
      emailSent: true
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail
};
