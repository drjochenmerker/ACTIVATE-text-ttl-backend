import { Router } from 'express';
import { writeToLog } from '../services/utils';
import { logFilenames } from '../data/staticContent';

const router = Router();

router.post('/', async (req, res) => {
	writeToLog(logFilenames.misc, "Login attempt: ", JSON.stringify(req.headers));
	const password = req.body.password;

	if (password == `${process.env.ROOT_PASSWORD}`) {
		res.status(200).json({
			success: true,
			role: 'root',
			message: 'Login successful'
		});
		writeToLog(logFilenames.misc, "Root login succeeded: ", JSON.stringify(req.headers));
		return;
	}
	else if (password == `${process.env.STUDENT_PASSWORD}`) {
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