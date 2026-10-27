const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single('file');

exports.uploadUserImage =  (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "We couldn't accept that image. Please choose a supported image and try again.",
        });
      }
      console.error("Image upload failed:", err);
      return res.status(500).json({
        success: false,
        message: "We couldn't upload your image right now. Please try again.",
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Choose an image to upload.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    return res.json({ success: true, url: imageUrl, imageName : req.file.filename });
  });
};


