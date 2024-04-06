import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import { Contact } from '../Model.js'; 

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'contact.html'));
});

router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.sendFile(path.join(__dirname, '..', 'views', 'done.html'));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
