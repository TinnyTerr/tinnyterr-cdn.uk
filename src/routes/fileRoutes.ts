import { Router } from "express";
import {
	uploadFile,
	getFileMetadata,
	downloadFile,
	deleteFile,
	getThumbnail,
} from "../controllers/fileController";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../config/multerConfig";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/:shortUrl", getFileMetadata);
router.get("/downloads/:shortUrl", downloadFile);
router.get("/downloads/:shortUrl/thumbnail", getThumbnail);
router.delete("/delete/:shortUrl", authenticate, deleteFile);
router.get("/delete/:shortUrl", authenticate, deleteFile);

export default router;
