const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const uploadDirectory = "public/uploads/";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  },
});

// File type validation and size limitation (e.g., 2MB max)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"));
    }
  },
}).single("file");

exports.uploadImage = (req, res) => {
  console.log("Received request to upload an image", req); // Log request received

  upload(req, res, function (err) {
    if (err) {
      console.error("Error during file upload:", err.message); // Log the error
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({
            success: false,
            message: "File upload error",
            error: err.message,
          });
      }
      return res
        .status(400)
        .json({
          success: false,
          message: "Failed to upload image",
          error: err.message,
        });
    }

    if (!req.file) {
      console.warn("No file uploaded"); // Log warning for missing file
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    console.log("File successfully uploaded:", req.file); // Log file details

    // Send success message with file details (you can also return the file URL if needed)
    const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "Image uploaded successfully!",
      fileUrl: fileUrl, // Return the file URL
    });
  });
};
