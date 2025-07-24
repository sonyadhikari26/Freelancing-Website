const createError = require("../utils/createError.js");

const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "No file uploaded"));
    }

    // Return the file path
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: "File uploaded successfully",
      url: filePath,
    });
  } catch (err) {
    next(err);
  }
};

const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(createError(400, "No files uploaded"));
    }

    // Return array of file paths
    const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
    
    res.status(200).json({
      message: "Files uploaded successfully",
      urls: filePaths,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};
