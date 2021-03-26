/* eslint-disable @typescript-eslint/no-unused-vars */
import multer from '@koa/multer';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import path from 'path';

import fs from 'fs';

const tempFolder = path.join(__dirname, '../../attachments');

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (arg0: any, arg1: any) => void) => {
    if (!fs.existsSync(tempFolder)) {
      fs.mkdir(tempFolder, (err) => {
        if (err) {
          throw new Error(err.message);
        }
      });
    }

    cb(null, './attachments');
  },

  filename: (
    _req: any,
    file: { mimetype: string },
    cb: (arg0: null, arg1: any) => void,
  ) => {
    const filetype = mime.extension(file.mimetype);

    cb(null, `${uuidv4()}.${filetype}`);
  },
});

export const upload = multer({ storage });
