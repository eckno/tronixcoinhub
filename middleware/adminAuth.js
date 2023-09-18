const { empty } = require('../lib/utils');


const AdminLog = async (req, res, next) => {
  if (!empty(req.session.user.tag) && req.session.user.tag === 'admin') {
    // User has an active session and isid exists, proceed to the next middleware/route
    next();
  } else {
    // Redirect the user to the login page
    res.redirect('/secure');
  }
}

module.exports = AdminLog;