
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('../base');
const { ROUTE_TRADES, ROUTE_DEPOSITS, ROUTE_WITHDRAWALS, ROUTE_WALLETS } = require("../../lib/page-routes");
const { empty } = require('../../lib/utils');
const { generateRandomCodes } = require("../../lib/utils");
const EmailService = require("../emailController");

class AdminController extends BaseController {

	constructor(props) {
		super(props);
		this.footer_scripts = ["/js/app/main.js"];
	}

	async indexAction(req, res) {
		try {
			const _id = req.session.user.isid;
			const user_id = req.session.user.user_id;
			const user_details = await this.db.collection("users").doc(_id).get();
			const tradeCount = await this.db.collection("trades").where("status", "==", 'started').count().get();
            const memberCount = await this.db.collection("users").count().get();
			const deposits = await this.db.collection("deposits").where("status", "==", "waiting").count().get();
			const withdrawals = await this.db.collection("withdrawals").where("status", "==", "processing").count().get();

			if(!user_details.exists){
				return res.redirect('/');
			}

			res.render('admin/index', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                user_details: user_details.data(),
                members: memberCount.data().count,
				trades: tradeCount.data().count,
				deposits: deposits.data().count,
				withdrawals: withdrawals.data().count
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
	}

    async viewDeposits(req, res) {
		try {
            const listOfDeposits = await this.db.collection("deposits").where("status", "==", "waiting").get();
			res.render('admin/deposits', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                deposits: listOfDeposits
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
	}

    async viewWithdrawals(req, res) {
		try {
            const withdrawals = await this.db.collection("withdrawals").where("status", "==", "processing").get();

			res.render('admin/withdrawals', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                withdrawals
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
        
	}

    async viewMembers(req, res) {
		try {
            const members = await this.db.collection("users").where("tag", "==", "member").get();
			res.render('admin/members', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                members
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
	}

    async viewTrades(req, res) {
		try {
            const trades = await this.db.collection("trades").where("status", "==", "started").get();
			res.render('admin/trades', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                trades
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
	}

	async postApproveDeposit(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				//console.log(post["depid"]);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["depid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}
				const depid = post['depid'];
				const dep_data = await this.db.collection("deposits").doc(depid).get();
				if(!dep_data.exists){
					response['msg'] = "Invalid deposit data. Please be sure to confirm your request";
					
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}
				uid = dep_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";
						
						req.flash('error', response);
						return res.redirect(ROUTE_DEPOSITS);
					}
				}
				else{
					response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";
					
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}

				const deposit_update = {
					status: "deposited"
				};
				const user_update = {
					balance: user_record_data.balance + dep_data.data().amount,
					deposit: 0,
					total_deposited: user_record_data.total_deposited + dep_data.data().amount
				};

				const updateDeposit = await this.db.collection('deposits').doc(depid).update(deposit_update);
				if(updateDeposit){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Account deposit have been added successfuly");
						return res.redirect(ROUTE_DEPOSITS);
					}
				}

				response['msg'] = "Something went wrong. Please contact site support";
				req.flash('error', response);
				return res.redirect(ROUTE_DEPOSITS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_DEPOSITS);
		}
	}

	async postDeclineDeposit(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["depid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}
				const depid = post['depid'];
				const dep_data = await this.db.collection("deposits").doc(depid).get();
				if(!dep_data.exists){
					response['msg'] = "Invalid deposit data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);				
				}
				uid = dep_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";
						req.flash('error', response);
						return res.redirect(ROUTE_DEPOSITS);
					}
				}
				else{
					response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}

				const deposit_update = {
					status: "cancelled"
				};
				const user_update = {
					deposit: 0,
				};

				const updateDeposit = await this.db.collection('deposits').doc(depid).update(deposit_update);
				if(updateDeposit){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Account deposit have been cancelled successfuly");
						
						return res.redirect(ROUTE_DEPOSITS);
					}
				}
			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_DEPOSITS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_DEPOSITS);		}
	}

	async postDeleteDeposit(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["depid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";

					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}
				const depid = post['depid'];
				const dep_data = await this.db.collection("deposits").doc(depid).get();
				if(!dep_data.exists){
					response['msg'] = "Invalid deposit data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}
				uid = dep_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";

						req.flash('error', response);
						return res.redirect(ROUTE_DEPOSITS);
					}
				}
				else{
					response['msg'] = "Invalid deposit user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_DEPOSITS);
				}

				const user_update = {
					deposit: 0,
				};

				const updateDeposit = await this.db.collection('deposits').doc(depid).delete();
				if(updateDeposit){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Deposit have been deleted successfuly");
						return res.redirect(ROUTE_DEPOSITS);
					}
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_DEPOSITS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
	}

	//WITHDRAWALS

	async postPaidWithdrawal(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["wid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				const wid = post['wid'];
				const get_data = await this.db.collection("withdrawals").doc(wid).get();
				if(!get_data.exists){
					response['msg'] = "Invalid withdrawal record. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				uid = get_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid user data. Please be sure to confirm your request";
						req.flash('error', response);
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}
				else{
					response['msg'] = "Invalid user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}

				const withdraw_update = {
					status: "paid"
				};
				const user_update = {
					withdrawal: 0,
					total_withdrawn: user_record_data.total_withdrawn + get_data.data().amount
				};

				const update_w = await this.db.collection('withdrawals').doc(wid).update(withdraw_update);
				if(update_w){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Withdrawal have been approved successfuly");
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
	}

	async postCancelWithdrawal(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["wid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				const wid = post['wid'];
				const get_data = await this.db.collection("withdrawals").doc(wid).get();
				if(!get_data.exists){
					response['msg'] = "Invalid withdrawal record. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				uid = get_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid user data. Please be sure to confirm your request";
						req.flash('error', response);
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}
				else{
					response['msg'] = "Invalid user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}

				const withdraw_update = {
					status: "cancelled"
				};
				const user_update = {
					withdrawal: 0,
				};

				const update_w = await this.db.collection('withdrawals').doc(wid).update(withdraw_update);
				if(update_w){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Withdrawal have been cancelled successfuly");
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
	}

	async postDeleteWithdrawal(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["wid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				const wid = post['wid'];
				const get_data = await this.db.collection("withdrawals").doc(wid).get();
				if(!get_data.exists){
					response['msg'] = "Invalid withdrawal record. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}
				uid = get_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
							user_record_data = doc.data();
						})
					}else{
						response['msg'] = "Invalid user data. Please be sure to confirm your request";
						req.flash('error', response);
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}
				else{
					response['msg'] = "Invalid user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_WITHDRAWALS);
				}

				const user_update = {
					withdrawal: 0,				};

				const update_w = await this.db.collection('withdrawals').doc(wid).delete();
				if(update_w){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "Withdrawal have been deleted successfuly");
						return res.redirect(ROUTE_WITHDRAWALS);
					}
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_WITHDRAWALS);
		}
	}

	async postAddTradeProfit(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const post = AdminController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["profit", "tid"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "Please fill empty Fields";
					response['error'] = errors;

					return AdminController.sendFailResponse(res, response);
				}

				const _data = {
					profit: post['profit'],
				}
				const tid = post['tid'];

				const addProfit = await this.db.collection("trades").doc(tid).update(_data);

				if(addProfit && _.isObject(addProfit)){
					// const mail = {
					// 	user_data: {firstname:req.session.user.uname, amount: _data.amount, transaction_id: _data.wid}, file_path: "../views/emails/withdrawal.handlebars", subject: "You have placed withdrawal"
					// }
					// const emailService = new EmailService();
					// const send_email = await emailService.initEmail(mail);
					// if(send_email){
					// 	console.log('success');
					// }
					req.flash("success", "Profit added successfully to trade");
					response['redirect_url'] = ROUTE_TRADES;
					return AdminController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Error !! Please confirm your entries or contact support";
	
				return AdminController.sendFailResponse(res, response);
			}else{
				let response = {};

				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact support";
	
				return AdminController.sendFailResponse(res, response);
			}
		}
		catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return AdminController.sendFailResponse(res, error);
		}
	}

	async postTrades(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["trade_id"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No user record found";
					req.flash('error', response);
					return res.redirect(ROUTE_TRADES);
				}
				const tid = post['trade_id'];
				const get_data = await this.db.collection("trades").doc(tid).get();
				if(!get_data.exists){
					response['msg'] = "Invalid trade record. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_TRADES);
				}
				uid = get_data.data().uid;
				if(!empty(uid)){
					const user_data = await this.db.collection("users").where("account_id", "==", uid).get();
					if(!user_data.empty){
						user_data.forEach((doc) => {
							user_record_id = doc.id;
						})
					}else{
						response['msg'] = "Invalid user data. Please be sure to confirm your request";
						req.flash('error', response);
						return res.redirect(ROUTE_TRADES);
					}
				}
				else{
					response['msg'] = "Invalid user data. Please be sure to confirm your request";
					req.flash('error', response);
					return res.redirect(ROUTE_TRADES);
				}

				const _update = {
					status: "completed"
				};
				const user_update = {
					trading: 0,
				};

				const update_ = await this.db.collection('trades').doc(tid).update(_update);
				if(update_){
					const updateUser = await this.db.collection("users").doc(user_record_id).update(user_update);
					if(updateUser){
						req.flash("success", "User trade successfully completed");
						return res.redirect(ROUTE_TRADES);
					}
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_TRADES);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_TRADES);
		}
	}

	async viewWallet(req, res) {
		try {
            const wallets = await this.db.collection("wallets").get();
			res.render('admin/wallets', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
                wallets
			}));
		} catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			res.redirect('/');
		}
	}

	async postWallets(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const post = AdminController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["coin", "network", "address"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "Please fill empty Fields";
					response['error'] = errors;

					return AdminController.sendFailResponse(res, response);
				}

				const _data = {
					coin: post['coin'],
					network: post['network'],
					address: post['address'],
					wallet_id: generateRandomCodes(1, 15, 15)[0]
				}

				const addWallet = await this.db.collection("wallets").doc(_data.wallet_id).set(_data);

				if(addWallet && _.isObject(addWallet)){
					req.flash("success", "Wallet address added successfully");
					response['redirect_url'] = ROUTE_WALLETS;
					return AdminController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Error !! Please confirm your entries or contact support";
	
				return AdminController.sendFailResponse(res, response);
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact support";
	
				return AdminController.sendFailResponse(res, response);
			}
		}
		catch (e) {
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return AdminController.sendFailResponse(res, error);
		}
	}

	async deleteWallet(req, res) {
		try{
				const post = AdminController.sanitizeRequestData(req.params);
				let uid = "", user_record_id = "", user_record_data = {}, response = {};
				const required_fields = ["wallet_id"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "No wallet record found";
					req.flash('error', response);
					return res.redirect(ROUTE_WALLETS);
				}
				const wid = post['wallet_id'];

				const delete_wallet = await this.db.collection('wallets').doc(wid).delete();
				if(delete_wallet){
					req.flash("success", "Wallet deleted successfuly");
					return res.redirect(ROUTE_WALLETS);
				}

			response['msg'] = "Something went wrong. Please contact site support";
			req.flash('error', response);
			return res.redirect(ROUTE_WALLETS);
		}
		catch(e){
			let error = 'An error occurred processing your request. Please check your request and try again';
			console.log(e);
			if (e.name === 'CustomError' || e.name === 'ValidationError') {
				error = e.message
			}
			console.log(error);
			req.flash('error', error);
			return res.redirect(ROUTE_WALLETS);
		}
	}

}

module.exports = AdminController;
