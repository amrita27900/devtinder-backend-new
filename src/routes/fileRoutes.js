const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const router = express.Router();
const mongoURI = "mongodb+srv://trivediamrita2790_db_user:ofDq4LQWhVuhGagp@cluster0.wum3net.mongodb.net/devtinder?retryWrites=true&w=majority";

// Connect to MongoDB
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GridFS bucket
let gfsBucket;
conn.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("✅ GridFSBucket ready");
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
// router.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded ❌" });

//   const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
//     contentType: req.file.mimetype,
//   });

//   uploadStream.end(req.file.buffer);

//   uploadStream.on("finish", (file) => {
//     res.status(200).json({ file, message: "File uploaded successfully ✅" });
//   });

//   uploadStream.on("error", (err) => {
//     res.status(500).json({ message: "Upload error", error: err.message });
//   });
// });
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded ❌" });
  }

  const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on("finish", () => {
    // ✅ Manually construct file info, including _id
    const file = {
      _id: uploadStream.id,
      filename: uploadStream.filename,
      length: uploadStream.length,
      contentType: uploadStream.options.contentType,
    };

    console.log("✅ File uploaded:", file);

    res.status(200).json({
      file,
      message: "File uploaded successfully ✅",
    });
  });

  uploadStream.on("error", (err) => {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload error", error: err.message });
  });
});


// Download by filename
// router.get("/files/:filename", async (req, res) => {
//   try {
//     const cursor = gfsBucket.find({ filename: req.params.filename });
//     const files = await cursor.toArray();

//     if (!files || files.length === 0) return res.status(404).json({ message: "File not found ❌" });

//     gfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
router.get("/files/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads"
    });

    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found ❌" });
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    res.set("Content-Type", files[0].contentType);
    downloadStream.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving file" });
  }
});


// List files
router.get("/files", async (req, res) => {
  try {
    const files = await gfsBucket.find().toArray();
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
