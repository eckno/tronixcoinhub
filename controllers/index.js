
/**
 * All home controller actions
 * Only service calls should be made here
 */

const _ = require('lodash');
const BaseController = require('./base');

class IndexController extends BaseController {

	constructor(props) {
		super(props);
	}

	async indexAction(req, res) {
		try {
			res.render('index', this.setTemplateParameters(req, {
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

	async viewAbout(req, res) {
		try {
			res.render('index/about', this.setTemplateParameters(req, {
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

	async viewContact(req, res) {
		try {
			res.render('index/contact', this.setTemplateParameters(req, {
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

	async viewPlans(req, res) {
		try {
			res.render('index/plans', this.setTemplateParameters(req, {
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

module.exports = IndexController;
