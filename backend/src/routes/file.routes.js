import express from "express";
import uploadFileController from "../utils/uploadFile.js";
import { auth } from "../middleware/jwtAuth.js";
import multer from 'multer';

// config using multer for save in local disk
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname);
//     }
//   });

// config multer if want only using memory not save in local
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const uploadFileRoutes = express.Router();

uploadFileRoutes.post('/upload-file/:request', [auth, upload.single('file')], uploadFileController.uploadFile);

export default uploadFileRoutes;