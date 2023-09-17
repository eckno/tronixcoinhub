/**
 * Home Page and Static Pages
 * @type {e | (() => Express)}
 */

const express = require('express');
const router = express.Router();
const CheckSession = require("../../middleware/userAuth");
const {	ROUTE_ADMIN, ROUTE_WALLETS, ROUTE_DEPOSITS, ROUTE_WITHDRAWALS, ROUTE_MEMBERS, ROUTE_TRADES } = require('../../lib/page-routes');

const AdminController = require('../../controllers/admin/index');
const DashboardController = require('../../controllers/secure/index');


router.get(ROUTE_ADMIN, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.indexAction(req, res);
});

router.get(ROUTE_DEPOSITS, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.viewDeposits(req, res);
});

router.get(`${ROUTE_DEPOSITS}/:depid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postApproveDeposit(req, res);
});

router.get(`${ROUTE_DEPOSITS}/cancel/:depid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postDeclineDeposit(req, res);
});

router.get(`${ROUTE_DEPOSITS}/delete/:depid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postDeleteDeposit(req, res);
});

router.get(ROUTE_WITHDRAWALS, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.viewWithdrawals(req, res);
});

router.get(`${ROUTE_WITHDRAWALS}/:wid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postPaidWithdrawal(req, res);
});
router.get(`${ROUTE_WITHDRAWALS}/cancel/:wid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postCancelWithdrawal(req, res);
});
router.get(`${ROUTE_WITHDRAWALS}/delete/:wid`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postDeleteWithdrawal(req, res);
});

router.get(ROUTE_MEMBERS, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.viewMembers(req, res);
});

router.get(ROUTE_TRADES, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.viewTrades(req, res);
});

router.post(ROUTE_TRADES, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postAddTradeProfit(req, res);
});
router.get(`${ROUTE_TRADES}/:trade_id`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postTrades(req, res);
});

router.get(ROUTE_WALLETS, CheckSession, async (req, res) => {
	const dashboardController = new DashboardController(req);
    const adminController = new AdminController();

	await dashboardController.initialize(req);
	return adminController.viewWallet(req, res);
});
router.get(`${ROUTE_WALLETS}/:wallet_id`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.deleteWallet(req, res);
});
router.post(`${ROUTE_WALLETS}`, CheckSession, async (req, res) => {
    const adminController = new AdminController();
	return adminController.postWallets(req, res);
});

module.exports = router;
