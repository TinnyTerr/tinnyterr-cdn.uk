import { Router } from "express";
import { upload } from "../../config/multerConfig";
import {
	deleteFile,
	downloadFile,
	getFileMetadata,
	getThumbnail,
	uploadFile,
} from "../../controllers/fileController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/:shortUrl", getFileMetadata);
router.get("/downloads/:shortUrl", downloadFile);
router.get("/downloads/:shortUrl/thumbnail", getThumbnail);
router.delete("/delete/:shortUrl", authenticate, deleteFile);
router.get("/delete/:shortUrl", authenticate, deleteFile);

export default router;
