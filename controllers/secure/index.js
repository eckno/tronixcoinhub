
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('../base');
const { ROUTE_PROFILE, ROUTE_DEPOSIT_SUMMARY, ROUTE_DASHBOARD } = require("../../lib/page-routes");
const { empty } = require('../../lib/utils');
const { generateRandomCodes } = require("../../lib/utils");

class DashboardController extends BaseController {

	constructor(props) {
		super(props);
		this.footer_scripts = ["/js/app/main.js"];
	}

	async initialize(req) {
		try {
		  	const user_id = req.session.user.isid;
			const infos = await this.db.collection("users").doc(user_id).get();
			if(infos.exists){
				this.client_name = `${infos.data().lastname} ${infos.data().firstname}`;
				this.username = infos.data().username;
				this.balance = infos.data().balance;
			}
		} catch (error) {
		  console.error('Error during async operation:', error);
		}
	  }

	async indexAction(req, res) {
		try {
			const user_id = req.session.user.isid;
			const user_details = await this.db.collection("users").doc(user_id).get();
			if(!user_details.exists){
				return res.redirect('/');
			}

			res.render('secure/dashboard', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
				user_details
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

	async viewProfile(req, res) {
		try {
			const user_id = req.session.user.isid;
			const user_details = await this.db.collection("users").doc(user_id).get();
			if(!user_details.exists){
				return res.redirect('/');
			}
			res.render('secure/profile', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
				user_details: user_details.data()
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

	async postProfile(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.isid;
				const post = DashboardController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["phone", "city", "country", "zipcode"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "Please fill empty Fields";
					response['error'] = errors;

					return DashboardController.sendFailResponse(res, response);
				}

				const user_data = {
					phone: post['phone'],
					city: post['city'],
					country: post['country'],
					zipcode: post['zipcode'],
					profile_completion: 80,
				}
				const update_user = await this.db.collection("users").doc(user_id).update(user_data);

				if(update_user && _.isObject(update_user)){
					req.flash("success", "Your account has been updated successfully");
					response['redirect_url'] = ROUTE_PROFILE;
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Error !! Please confirm your entries or contact admin";
	
				return DashboardController.sendFailResponse(res, response);
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async postPassword(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.isid;
				const post = DashboardController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["oldpassword", "newpassword", "confirmpassword"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "Please fill empty Fields";
					response['error'] = errors;

					return DashboardController.sendFailResponse(res, response);
				}
				
			if(post["newpassword"] !== post["confirmpassword"]){
				response['msg'] = "User Error";
				response['error'] = "Your new password are not matching. Please check your inputs!";
	
				return DashboardController.sendFailResponse(res, response);
			}

			const findUser = await this.db.collection("users").doc(user_id).get();
			if(!findUser.exists){
				response['msg'] = "User Error";
				response['error'] = "Account data incorrect. Please contact admin";

				return DashboardController.sendFailResponse(res, response);
			}

			let current_auth = findUser.data().password;
			if(!_.isEmpty(current_auth)){
				if(post['oldpassword'] !== current_auth){
					response['msg'] = "User Error";
					response['error'] = "Your current password is incorrect. Please check your inputs!";
	
					return DashboardController.sendFailResponse(res, response);
				}
				const user_data = {
					password: post['newpassword'],
				}
				const update_user = await this.db.collection("users").doc(user_id).update(user_data);

				if(update_user && _.isObject(update_user)){
					response['msg'] = "Success";
					response['success_message'] = "Your password has been updated successfully";
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Please confirm your entries or contact admin";
	
				return DashboardController.sendFailResponse(res, response);
			}
			response['msg'] = "Error";
			response['error'] = "Please confirm your entries or contact admin";

			return DashboardController.sendFailResponse(res, response);
				
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async post2faSetting_enable(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.isid;
				let response = {};

			const findUser = await this.db.collection("users").doc(user_id).get();
			if(!findUser.exists){
				response['msg'] = "User Error";
				response['error'] = "Account data incorrect. Please contact admin";

				return DashboardController.sendFailResponse(res, response);
			}
			const login_code = generateRandomCodes(1, 6, 6);
			const profile_completion = (findUser.data().profile_completion !== 100) ? findUser.data().profile_completion + 20 : findUser.data().profile_completion;
				const user_data = {
					settings: {
						using_2fa: "Yes"
					},
					login_code: login_code,
					profile_completion
				}
				const update_user = await this.db.collection("users").doc(user_id).update(user_data);

				if(update_user && _.isObject(update_user)){
					///SEND LOGIN CODE EMAIL

					req.flash("success", "You have enabled 2fa in your account. Please check your email for your login code");
					response['redirect_url'] = ROUTE_PROFILE;
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "We could not enable 2fa on your account. Please contact admin";
	
				return DashboardController.sendFailResponse(res, response);
				
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async post2faSetting_disable(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.isid;
				let response = {};

			const findUser = await this.db.collection("users").doc(user_id).get();
			if(!findUser.exists){
				response['msg'] = "User Error";
				response['error'] = "Account data incorrect. Please contact admin";

				return DashboardController.sendFailResponse(res, response);
			}
			const profile_completion = findUser.data().profile_completion - 20;
				const user_data = {
					settings: {
						using_2fa: "No"
					},
					login_code: "",
					profile_completion
				}
				const update_user = await this.db.collection("users").doc(user_id).update(user_data);

				if(update_user && _.isObject(update_user)){
					///SEND LOGIN CODE EMAIL

					req.flash("success", "You have disabled 2fa in your account.");
					response['redirect_url'] = ROUTE_PROFILE;
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "We could not disable 2fa on your account. Please contact admin";
	
				return DashboardController.sendFailResponse(res, response);
				
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async postNotifications(req, res) {
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.isid;
				const post = DashboardController.sanitizeRequestData(req.body);
				let response = {};

			const findUser = await this.db.collection("users").doc(user_id).get();
			if(!findUser.exists){
				response['msg'] = "User Error";
				response['error'] = "Account data incorrect. Please contact admin";

				return DashboardController.sendFailResponse(res, response);
			}
				const user_data = {
					settings: {
						email_notification: (!empty(post['emailNotification'])) ? "Yes" : "No",
						withdrawal_email: (!empty(post['withdrawalNotification'])) ? "Yes" : "No",
						deposit_email: (!empty(post['depositNotification'])) ? "Yes" : "No"
					}
				}
				const update_user = await this.db.collection("users").doc(user_id).update(user_data, {merge: true});

				if(update_user && _.isObject(update_user)){
					response['msg'] = "Success";
					response['success_message'] = "Settings updated successfully";
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Could not update. Please contact admin";
	
				return DashboardController.sendFailResponse(res, response);
				
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async viewDeposit(req, res) {
		try {
			res.render('secure/deposit', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: ''
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

	async viewDepositSummary(req, res) {
		try {
			const post = DashboardController.sanitizeRequestData(req.params);
			const depid = post['depid'];
			let deposit_wallet = "Please contact your account manager for a deposit wallet address."
			if(empty(depid)){
				return res.redirect(ROUTE_DASHBOARD);
			}
			const fetch_deposit_details = await this.db.collection("deposits").doc(depid).get();
			if(!fetch_deposit_details.exists){
				return res.redirect(ROUTE_DASHBOARD);
			}
			const coin = fetch_deposit_details.data().crypto_type;
			const network = fetch_deposit_details.data().crypto_network;
			const get_wallet_address = await this.db.collection("wallets").where("coin", "==", coin).where("network", "==", network).get();
			if(!get_wallet_address.empty){
				get_wallet_address.forEach(doc => {
					deposit_wallet = doc.data().address;
				})
			}
			res.render('secure/deposit_summary', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
				address: deposit_wallet,
				deposit: fetch_deposit_details.data()
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

	async postDeposit(req, res){
		try{
			if(!empty(req) && !empty(req.body)){
				const user_id = req.session.user.user_id;
				const isid = req.session.user.isid;
				const post = DashboardController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["amount", "crypto_type", "crypto_network"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "Please fill empty Fields";
					response['error'] = errors;

					return DashboardController.sendFailResponse(res, response);
				}

				const deposit_data = {
					amount: post['amount'],
					crypto_type: post['crypto_type'],
					crypto_network: post['crypto_network'],
					note: (!empty(post['note'])) ? post['note'] : "",
					depid: generateRandomCodes(1, 15, 15)[0],
					uid: user_id,
					status: "waiting"
				}

				const create_deposit = await this.db.collection("deposits").doc(deposit_data.depid).set(deposit_data);

				if(create_deposit && _.isObject(create_deposit)){
					this.db.collection("users").doc(isid).update({deposit: deposit_data.amount});
					req.flash("success", "Your deposit has been successfully created. <br><br>Kindly copy your generated wallet address and complete your transfer to fund your account.");
					response['redirect_url'] = `${ROUTE_DEPOSIT_SUMMARY}/${deposit_data.depid}`;
					return DashboardController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Error !! Please confirm your entries or contact admin";
	
				return DashboardController.sendFailResponse(res, response);
			}else{
				response['msg'] = "Error";
				response['error'] = "Something went wrong. Please contact your account manager";
	
				return DashboardController.sendFailResponse(res, response);
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
			return DashboardController.sendFailResponse(res, error);
		}
	}

	async viewWithdrawal(req, res) {
		try {
			res.render('secure/withdrawal', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: ''
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

	async initiateUserDetails(user_id) {
		let response = {};
			const user_details = await this.db.collection("users").doc(user_id).get();
			if(!user_details.exists){
				return response;
			}

			const client_name = `${user_details.data().lastname} ${user_details.data().firstname}`;
			const username = user_details.data().username;
			const balance = user_details.data().balance;

			response = {
				client_name,
				username,
				balance
			};

			return response;
	}

}

module.exports = DashboardController;
