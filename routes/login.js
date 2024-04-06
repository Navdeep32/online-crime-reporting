import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import { User } from '../Model.js'; // Adjust the import path as necessary

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// GET request for the login page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// POST request to handle login form submission
router.post("/", async (req, res) => {
    const { loginEmail, loginPassword } = req.body;

    try {
        const user = await User.findOne({ email: loginEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const isValidPassword = await bcrypt.compare(loginPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const userId = user._id;
        res.redirect(`/report?userId=${userId}`);
        // Generate session, JWT token, or any other form of authentication here
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
