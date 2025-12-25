const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const generateToken = require("../config/generateToken");

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please fill all the fields" });
    return;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  const user = await User.create({ name, email, password, pic });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Failed to create the User" });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

const authSocialUser = asyncHandler(async (req, res) => {
  const { email, name, pic } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    // 2. User exists? Return their info + A VALID TOKEN
    res.json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      pic: userExists.pic,
      token: generateToken(userExists._id),
    });
  } else {
    // 3. User doesn't exist? Create them.
    // NOTE: We generate a random password to satisfy your DB schema requirement
    const randomPassword = Math.random().toString(36).slice(-8) + Date.now();

    const user = await User.create({
      name,
      email,
      password: randomPassword,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the user");
    }
  }
});

module.exports = { allUsers, registerUser, authUser, authSocialUser };
