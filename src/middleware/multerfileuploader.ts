import multer from "multer"
import fs from "fs-extra"
import path from "path";



const tempDir = path.join(__dirname, '..', '..', 'public', 'temp');

fs.ensureDirSync(tempDir);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 export  const upload = multer(
    { 
        storage 
    })