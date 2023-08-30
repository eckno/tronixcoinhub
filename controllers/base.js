
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { ROUTE_LOGOUT } = require('../lib/page-routes');
const _ = require('lodash');
const { strtotime, preg_match, filter_var, humanize, empty, isObject, isArray } = require('../lib/utils');

/**
 * Base functionality for all routes/controllers to inherit in other controllers/routes
 */
class BaseController {
	constructor() {
		this.db = getFirestore();
		this.logout_url = ROUTE_LOGOUT;
		this.live_domain = process.env.LIVE_DOMAIN || "";
		this.footer_script = '';
		this.footer_scripts = [];
		this.header_stylesheets = [];
		this.header_stylesheet = "";
		this.is_live = false;
		this.is_dev = true;
		this.is_local = false;
		this.base_name = "Tronixcoinhub";

		this.client_name = "";
		this.username = "";
		this.balance = "";

		if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
			this.is_dev = false;
			this.is_local = false;
		} else {
			this.is_dev = true;
			if (process.env.NODE_ENV && process.env.NODE_ENV === "local") {
				this.is_local = true;
			} else {
				this.is_local = false;
			}
		}
	}

	/**
	 * merges data with utils render function
	 * set template data, merge local data with global data
	 * Note: global variable names should start with "_" to avoid duplicate names
	 * @param req
	 * @param localData
	 * @return {{}}
	 */
	setTemplateParameters(req, localData) {
		if (typeof localData === 'undefined') {
			localData = {};
		}

		// template version cache update e.g. ?style.css?v=<%= TEMPLATE_VERSION %>
		if (this.is_dev) {
			localData.TEMPLATE_VERSION = new Date().getTime();
		} else {
			localData.TEMPLATE_VERSION = '2023.00';
		}
		// add a single js script in /js/libs e.g. index for /js/libs/index.js?v=<%= TEMPLATE_VERSION %>
		if (this.footer_script !== '') {
			localData.footer_script = this.footer_script;
		}
		// add a reusable variales
		if (this.client_name !== '') {
			localData.client_name = this.client_name;
		}
		if (this.username !== '') {
			localData.username = this.username;
		}
		if (this.balance !== '') {
			localData.balance = this.balance;
		}
		// add a multiple js scripts with their full url with .js e.g. ["/js/libs/index"] for /js/libs/index.js?v=<%= TEMPLATE_VERSION %>
		if (this.footer_scripts.length > 0) {
			localData.footer_scripts = this.footer_scripts;
		}
		if (this.header_stylesheets.length > 0) {
			localData.header_stylesheets = this.header_stylesheets;
		}
		if (this.header_stylesheet.length > 0) {
			localData.header_stylesheet = this.header_stylesheet;
		}

		if (!localData.page_title) {
			localData.page_title = "";
    	}

		// if there is no local template data to merge with global data
		if (typeof localData === 'undefined') {
			localData = {};
		}

		localData._ga_tag = process.env.GA_TAG || '';

		return this.render(req, localData);
	}

	render(req, _obj) {
		const obj = {};
		// Handles flash messages
		// Adds flash messages to object variables
		if (req && _.has(req, 'session') && req.session.flash) {
			let msgObj
			while (msgObj = req.session.flash.shift()) {
				if (!_.has(obj, '_flash')) {
					obj._flash = {};
				}
				obj._flash[msgObj.type] = msgObj.message
			}
		}
		// leaving to ensure no breaking issues with old config
		for (const attr in _obj) {
			obj[attr] = _obj[attr];
		}

		obj['_server_date'] = new Date();
		return obj;
	}

	/**
	 * standard fail response object
	 * @param res
	 * @param data
	 */
	static sendFailResponse(res, errors) {
		res.status(400).send({success: false, errors});
	}

	/**
	 * standard success response object
	 * @param res
	 * @param data
	 */
	static sendSuccessResponse(res, data) {
		res.status(201).send({success: true, data});
	}

	/**
	 * log user out and go to logout_url
	 * @param req
	 * @param res
	 */
	logoutAction(req, res) {
		req.session.destroy();
		return res.redirect(this.logout_url);
	}

	/**
	 * check for server error error
	 * @param errorData
	 */
	static hasServerError(errorData) {
		let hasServerError = false;
		if (_.isObject(errorData)) {
			_.each(errorData, (errorData, errorKey) => {
				// error keys starting with _ are server errors except for _id
				if (_.isString(errorKey) && errorKey.substr(0, 1) === '_' && errorKey !== '_id') {
					hasServerError = true;
				}
			});
		}
		return hasServerError;
	}


    ///////SERVICES.........

    /**
	 *
	 * @param {*} data
	 * @returns
	 */
	 static sanitizeRequestData(data) {
		if (!empty(data)) {
			_.forEach(data, (d, key) => {
				data[key] = this.recursivelySanitize(d);
			});
		}
		return data;
	}

    /**
	 *
	 * @param {*} data
	 * @returns
	 */
	 static recursivelySanitize(data) {
		if (isObject(data)) {
			_.forEach(data, (d, key) => {
				if (_.isString(d) && _.includes(d, "%") !== false) {
					data[key] = decodeURI(d);
				}
				if (isObject(d)) {
					data[key] = this.recursivelySanitize(d);
				}
			});
		} else if (_.isString(data)) {
			data = data.trim();
		}
		return data;
	}

    /**
	 * check if attendee pass validation before submitting to api
	 * @param post
	 * @param required_fields
	 * @param name_fields
	 * @param vaildate_fields
	 * @param number_fields
	 * @param url_fields
	 * @return {array}
	 */
	validateFields(post = {}, required_fields = [], name_fields = [], vaildate_fields = [], number_fields = [], url_fields = [], non_english_name_fields = []) {
		let errors = {};
		const name_regex = /^(?=.*[\p{L}])([\p{L} .,'‘’´′‘’-]+)$/gu;
		const field_regex = /^(?=.*[\p{L}\p{N}])([\p{L}\p{N} &.,'‘’´′‘’-]+)$/gu;
		const number_regex = /^\d+$/;
		const non_english_regex = /^[^0-9]+$/;

		if (!empty(post) && (_.isObject(post) || _.isArray(post))) {
			_.forEach(post, (value, field) => {
				if (!empty(post[field])) {
					// format date fields value
					if ((_.includes(field, '_date') !== false) && date('m/d/Y', strtotime(post[field]))) {
						post[field] = date('m/d/Y', strtotime(post[field]));
					}

					let not_accepted = "";
					if (!empty(name_fields)) {
						if (_.includes(name_fields, field)) {
							const last_character = post[field].slice(-1);
							if (!preg_match(name_regex, post[field])) {
								if (preg_match(/^(?=.*[\p{L}]).+/gu, post[field])) {
									not_accepted = _.replace(post[field], /[\p{L} .,'‘’´′‘’-]/gui, '');
									not_accepted = _.trim(_.join(_.uniq(_.split(not_accepted, '')), ' '));

									errors[field] = `Sorry, ${not_accepted} ${(not_accepted.length > 1 ? " are not valid characters" : " is not a valid character")} for the ${humanize(field)} field.`;
								} else {
									errors[field] = `Sorry, the ${humanize(field)} field must contain at least one alphabetic character.`;
								}
							} else if (!preg_match(/^(?=.*[\p{L}]).+/gui, last_character)) {
								errors[field] = `Sorry, the ${humanize(field)} field must end with an alphabetic character.`;
							}
						}
					}

					if (!empty(vaildate_fields)) {
						if (_.includes(vaildate_fields, field) && !preg_match(field_regex, post[field])) {
							if (preg_match(/^(?=.*[\p{L}\p{N}]).+/gu, post[field])) {
								not_accepted = _.replace(post[field], /[\p{L}\p{N} .,'‘’´′‘’-]/gui, '');
								not_accepted = _.trim(_.join(_.uniq(_.split(not_accepted, '')), ' '));

								errors[field] = `Sorry, ${not_accepted} ${(not_accepted.length > 1 ? " are not valid characters" : " is not a valid character")} for the ${humanize(field)} field.`;
							} else {
								errors[field] = `Sorry, the ${humanize(field)} field must contain at least one alphabetic character.`;
							}
						}
					}

					if (!empty(number_fields) && _.includes(number_fields, field)) {
						/***** Validating Phone Number Field ****/
						if (!(post[field].length >= 10 && post[field].length <= 15) && preg_match(/^[+]?[0-9]+$/, post[field])) {
							errors[field] = `Please enter a valid ${humanize(field)} (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456)`;
						} else if (post[field].length === 10 && post[field].slice(0, 1) === "+") {
							errors[field] = `Please enter a valid ${humanize(field)} (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456)`;
						}
					}

					if (!empty(url_fields)) {
						if (_.includes(url_fields, field)) {
							if (!filter_var(_.trim(post[field]), "FILTER_VALIDATE_URL")) {
								errors[field] = "Please enter a valid URL Address e.g http://example.com/";
							}
						}
					}

					if (!empty(non_english_name_fields)) {
						if (_.includes(non_english_name_fields, field)) {
							if (!preg_match(non_english_regex, post[field])) {
								errors[field] = `Sorry the ${humanize(field)} field cannot contain numbers.`;
							}
						}
					}

					if (_.includes(['phone_number', 'phone', 'cell_phone'], field)) {
						if (!(post[field].length >= 10 && post[field].length <= 15 && preg_match(/^[+]?[0-9]+$/, post[field]))) {
							errors[field] = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456)';
						} else if (post[field].length === 10 && post[field].slice(0, 1) === "+") {
							errors[field] = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456). If Phone Number starts with +, it must be followed by at least 10 numerical numbers.';
						}
					}

					if (_.includes(['email', 'cc_email'], field)) {
						if (!filter_var(_.trim(post[field]), "FILTER_VALIDATE_EMAIL")) {
							errors[field] = "Please enter a valid Email Address e.g john@example.com";
						}
					}
				}
			});

			if (!empty(required_fields)) {
				_.forEach(required_fields, field => {
					if (empty(post[field])) {
						if (field === 'g-recaptcha-response') {
							errors['g-recaptcha-response'] = "Please verify you are human";
						} else {
							errors[field] = `The ${humanize(field)} field is required`;
						}
					}
				});
			}
		} else {
			errors['server_error'] = "Something went wrong please try again later";
		}

		return errors;
	}

}

module.exports = BaseController;