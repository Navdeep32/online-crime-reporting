import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { OTP, User, IncidentReport, Contact } from './Model.js';
import { connectDB } from './db.js';
import multer from "multer";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const upload = multer({ dest: 'uploads/' });
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.set('views', __dirname + '/views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take messages");
    }
});

function generateOTP() {
    return crypto.randomBytes(3).toString('hex');
}

async function sendOTP(email, otp) {
    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        await OTP.create({ email, otp: hashedOTP });
        const mailOptions = {
            from: 'navdeepkore283@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}. Please note that this OTP will expire after 5 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP:', error);
            } else {
                console.log('OTP sent:', info.response);
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get("/faq", (req, res) => {
    res.sendFile(__dirname + '/views/faq.html');
});

app.get("/saftytips", (req, res) => {
    res.sendFile(__dirname + '/views/saftytips.html');
});

app.get("/cyberCrimes", (req, res) => {
    res.sendFile(__dirname + "/views/cyberCrimes.html");
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/views/about.html");
});

app.get("/status", (req, res) => {
    res.sendFile(__dirname + '/views/status.html');
});

app.get("/contact", (req, res) => {
    res.sendFile(__dirname + '/views/contact.html');
});

app.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.sendFile(__dirname + "/views/done.html");
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/complaintId", (req, res) => {
    res.sendFile(__dirname + "/views/complaintId.html")
});

app.get("/signup", (req, res) => {
    res.render(__dirname + "/views/signup.ejs");
});

app.post('/signup', async (req, res) => {
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

        const userId = newUser._id
        res.redirect(`/verify?email=${signupEmail}&userId=${userId}`);
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/verify", (req, res) => {
    const email = req.query.email;
    const userId = req.query.userId;
    res.render(__dirname + "/views/verify.ejs", { email: email, userId: userId });
});

app.post('/verify', async (req, res) => {
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
            // res.status(200).render(__dirname + "/views/signup-success.ejs");
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

app.post('/login', async (req, res) => {
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

app.get("/report", (req, res) => {
    const userId = req.query.userId;
    res.render(__dirname + "/views/report.ejs", { userId: userId });
});

app.post('/report', upload.single('supportingDocuments'), async (req, res) => {
    try {
        const { userId, fullName, age, gender, mobileNumber, emailAddress, address, typeOfCrime, dateTimeOfIncident, stateUTS, incidentOccur, suspectName, suspectDetails, description } = req.body;

        if (!req.file) {
            return res.status(400).send('No document uploaded.');
        }

        const documentPath = req.file?.path;
        console.log(req.file.originalname);
        const documentExtension = req.file?.originalname.split('.').pop();
        const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
        if (!allowedExtensions.includes(documentExtension)) {
            return res.status(400).send("Invalid supporting document format.");
        }

        const newIncidentReport = new IncidentReport({ userId, fullName, age, gender, mobileNumber, emailAddress, address, typeOfCrime, dateTimeOfIncident, stateUTS, incidentOccur, suspectName, suspectDetails, description, supportingDocuments: documentPath });
        await newIncidentReport.save();


        res.sendFile(__dirname + "/views/reportSubmit.html");
        // res.status(201).send('Report submitted successfully');
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).send('Internal Server Error');
    }
});

connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running at port 3000");
        });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });