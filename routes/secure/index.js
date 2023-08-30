/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_DASHBOARD, ROUTE_PROFILE} = require('../../lib/page-routes');

const DashboardController = require('../../controllers/secure/index');


router.get(ROUTE_DASHBOARD, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.indexAction(req, res);
});

router.get(ROUTE_PROFILE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewProfile(req, res);
});

// router.get(ROUTE_REGISTER, (req, res) => {
// 	const authController = new AuthController();
// 	return authController.registerAction(req, res);
// });


module.exports = router;
