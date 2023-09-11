const checkSession = async (req, res, next) => {
  if (req.session.user && req.session.user.isid) {
    // User has an active session and isid exists, proceed to the next middleware/route
    next();
  } else {
    // Redirect the user to the login page
    res.redirect('/login');
  }
}

module.exports = checkSession;