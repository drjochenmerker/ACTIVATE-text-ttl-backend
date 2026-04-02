import { Router } from 'express';
import { writeToLog } from '../services/utils.js';
import { logFilenames } from '../data/staticContent.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/', async (req, res) => {
	writeToLog(logFilenames.misc, "Login attempt: ", JSON.stringify(req.headers));
	const password = req.body.password;
	const rootPasswordHash = process.env.ROOT_PASSWORD;
	const studentPasswordHash = process.env.STUDENT_PASSWORD;
	const jwtSecret = process.env.JWT_SECRET || 'activate-secret-key';

	if (rootPasswordHash && await bcrypt.compare(rootPasswordHash, password)) {
		const token = jwt.sign(
			{ role: 'root', timestamp: Date.now() },
			jwtSecret,
			{ expiresIn: '24h' }
		);
		res.status(200).json({
			success: true,
			role: 'root',
			token: token,
			message: 'Login successful'
		});
		writeToLog(logFilenames.misc, "Root login succeeded: ", JSON.stringify(req.headers));
		return;
	}
	else if (studentPasswordHash && await bcrypt.compare(studentPasswordHash, password)) {
		const token = jwt.sign(
			{ role: 'student', timestamp: Date.now() },
			jwtSecret,
			{ expiresIn: '24h' }
		);
		res.status(200).json({
			success: true,
			role: 'student',
			token: token,
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