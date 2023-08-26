
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('../base');

class AuthController extends BaseController {

	constructor(props) {
		super(props);
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

}

module.exports = AuthController;
