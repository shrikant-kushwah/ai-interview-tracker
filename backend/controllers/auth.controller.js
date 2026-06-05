import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendTokenResponse = (user, res) => {
  const token = generateToken(user._id);
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, {
    ...cookieOptions,
  });
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    const apiDomain = process.env.API_URL?.split("//")[1];
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 0,
      domain: isProduction ? apiDomain : "localhost",
    });
    res.json({ success: true, message: "Logged out successfully" });
}

export const getMe = async (req, res) => {  
    res.json({ success: true, user: req.user });
}
