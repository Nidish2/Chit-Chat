const express = require("express");
// 👇 Update the import to include authSocialUser
const {
  registerUser,
  authUser,
  allUsers,
  authSocialUser,
} = require("../controllers/userControllers");

const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", registerUser);
router.post("/login", authUser);

// 👇 ADD THIS NEW ROUTE
router.post("/social-login", authSocialUser);

router.get("/", protect, allUsers);

module.exports = router;
