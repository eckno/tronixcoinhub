const app = require('./app');

// Route groups
const index = require('./routes/index');
const auth = require('./routes/auth');
const dashboard = require('./routes/secure');
const admin = require('./routes/admin');


// Routes
app.use('/', index);
app.use('/', auth);
app.use('/', dashboard);
app.use('/', admin);


const IndexController = require('./controllers/index');

// No matching route
app.use((req, res, next) => {
  const indexController = new IndexController();
  res.render('unavailable', indexController.setTemplateParameters(req, {
    title: 'Oops!'
  }));
});
app.use((err, req, res, next) => {
	console.log(err)
	res.status(err.status || 500).json({ error: 'Internal server error' })
});

module.exports = app;
