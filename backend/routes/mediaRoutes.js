const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} = require("../controllers/mediaController");
const { protect, authorize } = require("../middleware/auth");

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

router.use(protect);

router.get("/", getMedia);
router.get("/:id", getMediaById);
router.post("/", authorize("admin", "coach", "sport_coordinator"), upload.single('file'), createMedia);
router.put("/:id", authorize("admin", "coach", "sport_coordinator"), updateMedia);
router.delete("/:id", authorize("admin", "coach", "sport_coordinator"), deleteMedia);

module.exports = router;
