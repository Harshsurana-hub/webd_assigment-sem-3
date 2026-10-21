const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashPass,
      role: role || "customer"
    });

    const authToken = jwt.sign(
      { userId: newUser._id, name: newUser.name, role: newUser.role },
      SECRET_KEY
    );

    res.json({ token: authToken, user: newUser });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const account = await User.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const authToken = jwt.sign(
      { userId: account._id, name: account.name, role: account.role },
      SECRET_KEY
    );

    res.json({ token: authToken, user: account });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId).select("-password");
    res.json(currentUser);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
