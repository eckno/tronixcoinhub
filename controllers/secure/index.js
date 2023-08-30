
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('../base');

class DashboardController extends BaseController {

	constructor(props) {
		super(props);
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
			res.render('secure/profile', this.setTemplateParameters(req, {
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
