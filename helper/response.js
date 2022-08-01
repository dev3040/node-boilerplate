exports.response_data = ({ res, statusCode, success, message, result, error }) => {
	let resultObj = {
		success:success,
		message:message,
		result:result,
		error:error
	};
	return res.status(statusCode).send(resultObj);
};