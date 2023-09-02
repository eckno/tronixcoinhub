/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_DASHBOARD, ROUTE_PROFILE, ROUTE_PROFILE_EDIT_PASSWORD, 
	ROUTE_PROFILE_EDIT_SETTINGS_2FA, ROUTE_PROFILE_EDIT_SETTINGS_2FA_DISABLE,
	ROUTE_PROFILE_EDIT_SETTINGS_NOTIFICATION} = require('../../lib/page-routes');

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

router.post(ROUTE_PROFILE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.postProfile(req, res);
});
router.post(ROUTE_PROFILE_EDIT_PASSWORD, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.postPassword(req, res);
});

router.post(ROUTE_PROFILE_EDIT_SETTINGS_2FA, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.post2faSetting_enable(req, res);
});
router.post(ROUTE_PROFILE_EDIT_SETTINGS_2FA_DISABLE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.post2faSetting_disable(req, res);
});
router.post(ROUTE_PROFILE_EDIT_SETTINGS_NOTIFICATION, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.postNotifications(req, res);
});

// router.get(ROUTE_REGISTER, (req, res) => {
// 	const authController = new AuthController();
// 	return authController.registerAction(req, res);
// });


module.exports = router;
