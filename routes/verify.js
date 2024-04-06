import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import crypto from "crypto";
import { OTP } from '../Model.js'; // Adjust the import path as necessary

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// GET request for the verify page
router.get("/", (req, res) => {
    const email = req.query.email;
    const userId = req.query.userId;
    res.render(path.join(__dirname, '..', 'views', 'verify.ejs'), { email: email, userId: userId });
});

// POST request to handle OTP verification
router.post("/", async (req, res) => {
    try {
        const email = req.body.email;
        const enteredOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;
        const userId = req.body.userId;

        const hashedEnteredOTP = crypto.createHash('sha256').update(enteredOTP).digest('hex');
        const otpData = await OTP.findOne({ email, otp: hashedEnteredOTP });

        if (!otpData) {
            res.status(400).send('Invalid verification code');
        } else {
            await OTP.deleteOne({ email });
            res.redirect(`/report?userId=${userId}`);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
