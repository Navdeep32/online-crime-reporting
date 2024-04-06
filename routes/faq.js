import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get("/", (req, res, next) => {
    const filePath = path.join(__dirname, '..', 'views', 'faq.html');
    res.sendFile(filePath);
});

export default router;