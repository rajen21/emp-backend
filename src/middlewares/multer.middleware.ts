import multer from "multer";
import { type Readable } from "stream";
import fs from "fs";
import path from "path";

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directoryPath = path.join(__dirname, '../../public/temp');
    
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    cb(null,"./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix+"-"+file.originalname);
  }
});

export const upload = multer({ storage });