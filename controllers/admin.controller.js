const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.loginAdmin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      token,
      admin: {
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existing = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    res.json({ success: true, message: "Admin created" });
  } catch {
    res.status(500).json({ message: "Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = jwt.sign({ id: admin._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5173/admin-reset/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your admin password",
      html: `<a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await Admin.findByIdAndUpdate(decoded.id, {
      password: hashedPassword,
    });

    res.json({ success: true });
  } catch {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.getProfile = (req, res) => {
  res.json(req.admin);
};
