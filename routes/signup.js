import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import { User } from '../Model.js'; // Adjust the import path as necessary
import bcrypt from "bcryptjs";
import { generateOTP, sendOTP } from '../utils.js'; // Adjust the import path as necessary

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get("/", (req, res) => {
    res.render(path.join(__dirname, '..', 'views', 'signup.ejs'));
});

router.post("/", async (req, res) => {
    const { username, signupEmail, signupPassword } = req.body;

    try {
        const existingUser = await User.findOne({ email: signupEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(signupPassword, salt);

        const newUser = new User({ username, email: signupEmail, password: hashedPassword, salt });
        await newUser.save();

        const otp = generateOTP();
        console.log("Generated otp: ", otp);
        sendOTP(signupEmail, otp);

        const userId = newUser._id;
        res.redirect(`/verify?email=${signupEmail}&userId=${userId}`);
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
