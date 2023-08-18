/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_LOGOUT, ROUTE_HOME, ROUTE_UNAVAILABLE} = require('../lib/page-routes');

const IndexController = require('../controllers/index');

router.get('/ofuoufoeufoefuefupeufpeu', async (req, res) => {
	await redis.flushall();
	res.end();
});
router.get(ROUTE_HOME, async (req, res) => {
	const indexController = new IndexController();
	return indexController.indexAction(req, res);
});

router.get(ROUTE_LOGOUT, (req, res) => {
	const indexController = new IndexController();
	return indexController.logoutAction(req, res);
});

/** Static Files */
router.get(ROUTE_UNAVAILABLE, (req, res) => {
	const _meta = {
		description: "",
		page_title: "Not Found"
	}
  	const indexController = new IndexController();
	res.render('unavailable', indexController.setTemplateParameters(req, {
		title: 'Oops!'
	}));
});

router.get(ROUTE_UNAVAILABLE, (req, res) => {
	const _meta = {
		description:"Your browser is Unsupported, Unfortunately, our website has new features that are unable to run on this version of your browser, please update your browser.",
		page_title:"Base project | Unsupported Browser",
		page_url:"/unsupported"
	}
  	const indexController = new IndexController();
	res.render('unsupported', indexController.setTemplateParameters(req, {
		title: 'Unsupported Browser',
		_meta
	}));
});


module.exports = router;
