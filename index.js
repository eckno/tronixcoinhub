
const Logger = require('./lib/logger');
Logger.init({
	dsn: process.env.SENTRY_DSN
});

// Routes
(async function () {
	try {
    const app = require('./route');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log('Server is up on port ' + port);
    });
	} catch (e) {
		Logger.captureException(e)
		setTimeout(() => {
			process.exit(0)
		}, 3000)
	}
})()




