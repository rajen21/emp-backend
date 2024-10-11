import multer from "multer";
import { type Readable } from "stream";

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
    cb(null,"./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix+"-"+file.originalname);
  }
});

export const upload = multer({ storage });