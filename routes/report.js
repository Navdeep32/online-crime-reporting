import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import path from "path";
import { IncidentReport } from '../Model.js'; // Adjust the import path as necessary

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: 'uploads/' }); // Make sure the 'uploads/' directory exists

// GET request for the report page
router.get("/", (req, res) => {
    const userId = req.query.userId;
    res.render(path.join(__dirname, '..', 'views', 'report.ejs'), { userId: userId });
});

// POST request to handle report form submission
router.post("/", upload.single('supportingDocuments'), async (req, res) => {
    try {
        const { userId, fullName, age, gender, mobileNumber, emailAddress, address, typeOfCrime, dateTimeOfIncident, stateUTS, incidentOccur, suspectName, suspectDetails, description } = req.body;

        if (!req.file) {
            return res.status(400).send('No document uploaded.');
        }

        const documentPath = req.file.path;
        console.log(req.file.originalname);
        const documentExtension = req.file.originalname.split('.').pop();
        const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
        if (!allowedExtensions.includes(documentExtension)) {
            return res.status(400).send("Invalid supporting document format.");
        }

        const newIncidentReport = new IncidentReport({ userId, fullName, age, gender, mobileNumber, emailAddress, address, typeOfCrime, dateTimeOfIncident, stateUTS, incidentOccur, suspectName, suspectDetails, description, supportingDocuments: documentPath });
        await newIncidentReport.save();

        res.sendFile(path.join(__dirname, '..', 'views', 'reportSubmit.html'));
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
