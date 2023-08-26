/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD} = require('../../lib/page-routes');

const AuthController = require('../../controllers/auth/index');


router.get(ROUTE_LOGIN, async (req, res) => {
	const authController = new AuthController();
	return authController.indexAction(req, res);
});

router.get(ROUTE_REGISTER, (req, res) => {
	const authController = new AuthController();
	return authController.registerAction(req, res);
});

router.get(ROUTE_FORGOT_PASSWORD, (req, res) => {
	const authController = new AuthController();
	return authController.resetPasswordAction(req, res);
});


module.exports = router;
