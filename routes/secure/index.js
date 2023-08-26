/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_DASHBOARD} = require('../../lib/page-routes');

const DashboardController = require('../../controllers/secure/index');


router.get(ROUTE_DASHBOARD, async (req, res) => {
	const dashboardController = new DashboardController();
	return dashboardController.indexAction(req, res);
});

// router.get(ROUTE_REGISTER, (req, res) => {
// 	const authController = new AuthController();
// 	return authController.registerAction(req, res);
// });


module.exports = router;
