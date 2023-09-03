
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('../base');
const { ROUTE_HOME, ROUTE_LOGIN, ROUTE_DASHBOARD } = require("../../lib/page-routes");
const { generateRandomCodes } = require("../../lib/utils");

class AuthController extends BaseController {

	constructor(props) {
		super(props);
		this.footer_scripts = ["/js/app/main.js"];
	}

	async indexAction(req, res) {
		try {
			res.render('auth/login', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
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

	async postIndexAction(req, res) {
		if(!_.isEmpty(req) && !_.isEmpty(req.body)){
			const post = AuthController.sanitizeRequestData(req.body);
			let response = {};
			const required_fields = ["email", "password"];
			const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
			if(!_.isEmpty(errors)){
				response['msg'] = "";
				response['error'] = errors;

				return AuthController.sendFailResponse(res, response);
			}
			const findUser = await this.db.collection("users").where("email", "==", post['email']).get();
			if(findUser.empty){
				response['msg'] = "User Error";
				response['error'] = "Incorrect email address or password. Please check your inputs!";

				return AuthController.sendFailResponse(res, response);
			}

			let user_id, isid, auth, email = "";
			findUser.forEach((user) => {
				isid = user.id;
				user_id = user.data().account_id;
				email = user.data().email;
				auth = user.data().password;
			});

			if(!_.isEmpty(user_id) && !_.isEmpty(isid) && !_.isEmpty(email)){
				if(post['password'] !== auth){
					response['msg'] = "User Error";
					response['error'] = "Incorrect email address or password. Please check your inputs!";
	
					return AuthController.sendFailResponse(res, response);
				}
				req.session.user = {isid, user_id, email }

				response['redirect_url'] = ROUTE_DASHBOARD;
				req.flash("success", "Login successful");
				return AuthController.sendSuccessResponse(res, response);
			}

			response['msg'] = "Error";
			response['error'] = "Error !! Please check your entries or contact admin";

			return AuthController.sendFailResponse(res, response);
		}else{
			response['msg'] = "Error";
			response['error'] = "Error !! Please check your entries or contact admin";

			return AuthController.sendFailResponse(res, response);
		}
	}

    async registerAction(req, res) {
		try {
			res.render('auth/register', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
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

	async postRegisterAction(req, res) {
		if(!_.isEmpty(req) && !_.isEmpty(req.body)){
			const post = AuthController.sanitizeRequestData(req.body);
			let response = {};
			const required_fields = ["first_name", "last_name", "email", "username", "password"];
			const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
			if(!_.isEmpty(errors)){
				response['msg'] = "Empty Fields";
				response['error'] = errors;

				return AuthController.sendFailResponse(res, response);
			}
			const findUser = await this.db.collection("users").where("email", "==", post['email']).count();
			if(findUser >= 1){
				response['msg'] = "User Error";
				response['error'] = "This user already exist. Please login to continue";
				response['redirect_url'] = ROUTE_LOGIN; 

				return AuthController.sendFailResponse(res, response);
			}

			const new_user_data = {
				firstname: post['first_name'],
				lastname: post['last_name'],
				email: post['email'],
				username: post['username'],
				password: post['password'],
				balance: 0,
				deposit: 0,
				withdrawal: 0,
				total_withdrawn: 0,
				total_deposited: 0,
				trading: 0,
				profile_completion: 20,
				account_id: generateRandomCodes(1, 25, 25)[0],
			}

			const create_new_user = await this.db.collection("users").doc(new_user_data['email']).set(new_user_data);
			//console.log(create_new_user);
			if(create_new_user && _.isObject(create_new_user)){
				response['msg'] = "Success";
				response['error'] = "You have successfully created a new user.";
				response['redirect_url'] = ROUTE_LOGIN;
				req.flash("success", "Your account has been created successfully. Please login to continue");
				return AuthController.sendSuccessResponse(res, response);
			}

			response['msg'] = "Error";
			response['error'] = "Error !! Please check your entries or contact admin";

			return AuthController.sendFailResponse(res, response);
		}else{
				response['msg'] = "Error";
				response['error'] = "Error !! Please check your entries or contact admin";

				return AuthController.sendFailResponse(res, response);
		}
	}

    async resetPasswordAction(req, res) {
		try {
			res.render('auth/forgot-password', this.setTemplateParameters(req, {
				page_styles: [],
				page_title: '',
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

	async postResetPasswordAction(req, res) {
		try{
			if(!_.isEmpty(req) && !_.isEmpty(req.body)){
				const post = AuthController.sanitizeRequestData(req.body);
				let response = {};
				const required_fields = ["email"];
				const errors = this.validateFields(post, required_fields, [], [], [],[],[]);
				if(!_.isEmpty(errors)){
					response['msg'] = "";
					response['error'] = errors;
	
					return AuthController.sendFailResponse(res, response);
				}
				const findUser = await this.db.collection("users").where("email", "==", post['email']).get();
				if(findUser.empty){
					response['msg'] = "User Error";
					response['error'] = "This user can not be found. Please check your email or register an account";
	
					return AuthController.sendFailResponse(res, response);
				}
	
				let user_id, isid, auth, email = "";
				findUser.forEach((user) => {
					isid = user.id;
					user_id = user.data().account_id;
					email = user.data().email;
					auth = user.data().password;
				});

				const update_user_data = { reset_token: generateRandomCodes(1, 15, 15) }
				const update_user = await this.db.collection("users").doc(email).update(update_user_data);
				
				if(update_user && _.isObject(update_user)){
					//////  SEND EMAIL AND RETURN SUCCESS AFTER SEND
					response['msg'] = "Success";
					response['success'] = "We have sent a reset link to your email address, follow the instruction to reset your password.";
					return AuthController.sendSuccessResponse(res, response);
				}
	
				response['msg'] = "Error";
				response['error'] = "Error !! Please check your entries or contact admin";
	
				return AuthController.sendFailResponse(res, response);
			}else{
				response['msg'] = "Error";
				response['error'] = "Error !! Please check your entries or contact admin";
	
				return AuthController.sendFailResponse(res, response);
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
			res.redirect('/');
		}
	}

}

module.exports = AuthController;
