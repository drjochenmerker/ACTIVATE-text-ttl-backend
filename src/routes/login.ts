import { Router } from 'express';
import { writeToLog } from '../services/utils';
import { logFilenames } from '../data/staticContent';

const router = Router();

router.post('/', async (req, res) => {
	writeToLog(logFilenames.misc, "Login attempt: ", JSON.stringify(req.headers));
	const password = req.body.password;
	// TODO: Differentiate between student password and root password	(instructor view)
	if (password == `${process.env.ROOT_PASSWORD}`) {
		res.status(200).json({
			success: true,
			message: 'Login successful'
		});
		writeToLog(logFilenames.misc, "Login succeeded: ", JSON.stringify(req.headers));
		return;
	}
	writeToLog(logFilenames.misc, "Login failed: ", JSON.stringify(req.headers));
	res.status(401).json({
		success: false,
		error: 'Wrong password'
	});
	return;
});


export default router;