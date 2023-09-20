"use strict";
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const BaseController = require('./base');
const nodemailer = require("nodemailer");
const { empty } = require('../lib/utils');


class EmailService extends BaseController {
    constructor () {
        super();
        this.from = (process.env.FROM_EMAIL) ? process.env.FROM_EMAIL : "support@tronixcoinhub.com";
        //this.
    }

    async mailSender({to_email, subject}, email_temp) {
        // send mail with defined transport object
        try{
            const transporter = nodemailer.createTransport({
            host: (this.is_dev === true) ? process.env.SMTP_SERVER_DEV : process.env.SMTP_SERVER_LIVE, //server337.web-hosting.com
            port: (this.is_dev === true) ? process.env.SMTP_PORT_DEV : process.env.SMTP_PORT_LIVE,
            secure: (this.is_dev === true) ? true : true,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: "support@tronixcoinhub.com",
                pass: "Adabel22",
            },
            tls: {
			  rejectUnauthorized: false,
			  minVersion: "TLSv1.2"
		        }
            });
            
            const info = await transporter.sendMail({
            from: `"support@tronixcoinhub.com" <${this.from}>`, // sender address
            to: to_email, // list of receivers
            subject: subject, // Subject line
            text: "", // plain text body
            html: email_temp, // html body
            });

            //console.log("Message sent: %s", info.messageId);

            return info.messageId;
        }
        catch (e) {
            console.log(e);
            return false;
        }
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    }

    async initEmail({user_data, file_path, subject}){
        try{
            if(!empty(user_data) && !empty(file_path)){
                let mail_to_send;
                let full_file_path = path.join(__dirname, file_path);
                if(!fs.existsSync(full_file_path)){
                    return false;
                }

                const get_mail_template = fs.readFileSync(path.join(__dirname, file_path), "utf-8");
                const mail_template = handlebars.compile(get_mail_template);

                mail_to_send = mail_template({...user_data});
                const sendEmail = await this.mailSender({to_email: user_data.email, subject}, mail_to_send);
                
                if(sendEmail){

                    return sendEmail;
                }

                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = EmailService;