import { Router } from 'express';
import { writeToLog } from '../services/utils.js';
import { logFilenames } from '../data/staticContent.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/', async (req, res) => {
	writeToLog(logFilenames.misc, "Login attempt: ", JSON.stringify(req.headers));
	const password = req.body.password;
	const rootPasswordHash = process.env.ROOT_PASSWORD;
	const studentPasswordHash = process.env.STUDENT_PASSWORD;

	if (rootPasswordHash && await bcrypt.compare(rootPasswordHash, password)) {
		res.status(200).json({
			success: true,
			role: 'root',
			message: 'Login successful'
		});
		writeToLog(logFilenames.misc, "Root login succeeded: ", JSON.stringify(req.headers));
		return;
	}
	else if (studentPasswordHash && await bcrypt.compare(studentPasswordHash, password)) {
		res.status(200).json({
			success: true,
			role: 'student',
			message: 'Login successful'
		});
		writeToLog(logFilenames.misc, "Student login succeeded: ", JSON.stringify(req.headers));
		return;
	}
	else {
		writeToLog(logFilenames.misc, "Login failed: ", JSON.stringify(req.headers));
		res.status(401).json({
			success: false,
			error: 'Wrong password'
		});
		return;
	}

});


export default router;