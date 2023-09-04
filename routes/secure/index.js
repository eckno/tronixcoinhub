/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();

const {	ROUTE_DASHBOARD, ROUTE_PROFILE, ROUTE_PROFILE_EDIT_PASSWORD, 
	ROUTE_PROFILE_EDIT_SETTINGS_2FA, ROUTE_PROFILE_EDIT_SETTINGS_2FA_DISABLE,
	ROUTE_PROFILE_EDIT_SETTINGS_NOTIFICATION, ROUTE_DEPOSIT, ROUTE_DEPOSIT_SUMMARY, 
	ROUTE_WITHDRAWAL, ROUTE_WITHDRAWAL_SUMMARY, ROUTE_TRADE} = require('../../lib/page-routes');

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
	//await dashboardController.initialize(req);
	return dashboardController.postProfile(req, res);
});
router.post(ROUTE_PROFILE_EDIT_PASSWORD, async (req, res) => {
	const dashboardController = new DashboardController(req);
	//await dashboardController.initialize(req);
	return dashboardController.postPassword(req, res);
});

router.post(ROUTE_PROFILE_EDIT_SETTINGS_2FA, async (req, res) => {
	const dashboardController = new DashboardController(req);
	//await dashboardController.initialize(req);
	return dashboardController.post2faSetting_enable(req, res);
});
router.post(ROUTE_PROFILE_EDIT_SETTINGS_2FA_DISABLE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	//await dashboardController.initialize(req);
	return dashboardController.post2faSetting_disable(req, res);
});
router.post(ROUTE_PROFILE_EDIT_SETTINGS_NOTIFICATION, async (req, res) => {
	const dashboardController = new DashboardController(req);
	//await dashboardController.initialize(req);
	return dashboardController.postNotifications(req, res);
});

router.get(ROUTE_DEPOSIT, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewDeposit(req, res);
});
router.post(ROUTE_DEPOSIT, async (req, res) => {
	const dashboardController = new DashboardController(req);
	return dashboardController.postDeposit(req, res);
});
router.get(`${ROUTE_DEPOSIT_SUMMARY}/:depid`, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewDepositSummary(req, res);
});
router.get(ROUTE_WITHDRAWAL, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewWithdrawal(req, res);
});
router.post(ROUTE_WITHDRAWAL, async (req, res) => {
	const dashboardController = new DashboardController(req);
	return dashboardController.postWithdrawal(req, res);
});
router.get(`${ROUTE_WITHDRAWAL_SUMMARY}/:wid`, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewWithdrawalSummary(req, res);
});
router.get(ROUTE_TRADE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	await dashboardController.initialize(req);
	return dashboardController.viewTrade(req, res);
});
router.post(ROUTE_TRADE, async (req, res) => {
	const dashboardController = new DashboardController(req);
	return dashboardController.postTrade(req, res);
});



module.exports = router;
