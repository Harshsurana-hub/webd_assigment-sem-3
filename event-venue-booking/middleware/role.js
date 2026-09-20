// Role-based authorization middleware

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    req.session.error = 'Please log in to access this page.';
    return res.redirect('/login');
  }
  if (req.session.userRole !== 'admin') {
    req.session.error = 'Access denied. Admin privileges required.';
    return res.redirect('/');
  }
  next();
}

function requireOrganiser(req, res, next) {
  if (!req.session || !req.session.userId) {
    req.session.error = 'Please log in to access this page.';
    return res.redirect('/login');
  }
  if (req.session.userRole !== 'organiser') {
    req.session.error = 'Access denied. Organiser account required.';
    return res.redirect('/');
  }
  next();
}

module.exports = { requireAdmin, requireOrganiser };
