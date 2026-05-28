const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  verifyUser,
  getPendingUsers,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const User = require("../model/users");

router.use(protect);

router.get("/", authorize("admin"), getUsers);
router.get("/pending", authorize("admin"), getPendingUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", authorize("admin"), async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: req.params.id });
    console.log("User deleted from database:", req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});
router.put("/:id/role", authorize("admin"), updateUserRole);
router.put("/:id/verify", authorize("admin"), verifyUser);

module.exports = router;
