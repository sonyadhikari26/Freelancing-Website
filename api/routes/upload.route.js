const express = require("express");
const upload = require("../middleware/multer.js");
const { uploadSingle, uploadMultiple } = require("../controllers/upload.controller.js");

const router = express.Router();

// Single file upload
router.post("/single", upload.single("file"), uploadSingle);

// Multiple files upload
router.post("/multiple", upload.array("files", 10), uploadMultiple);

module.exports = router;
