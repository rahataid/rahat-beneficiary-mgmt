import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + extension;
      callback(null, filename);
    },
  }),
};

export const deleteFileFromDisk = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
