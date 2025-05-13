import multer from "multer";
import fs from "fs-extra";
import path from "path";

// 1) Define and ensure a single temp directory
const tempDir = path.join(__dirname, "..", "public", "temp");
fs.ensureDirSync(tempDir);

// 2) Multer storage using that absolute path
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    // give each file a timestamp prefix to avoid collisions
    const name = `${Date.now()}_${file.originalname}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
