const User = require('../models/User');

// GET /login
exports.getLogin = (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.userRole === 'admin' ? '/admin/dashboard' : '/venues');
  }
  res.render('auth/login', {
    title: 'Login',
    layout: 'layouts/auth'
  });
};

// POST /login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.error = 'Please provide both email and password.';
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.session.error = 'Invalid email or password.';
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid email or password.';
      return res.redirect('/login');
    }

    // Set session
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    req.session.success = `Welcome back, ${user.name}!`;

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/venues');
  } catch (err) {
    console.error('Login error:', err);
    req.session.error = 'An error occurred. Please try again.';
    return res.redirect('/login');
  }
};

// GET /register
exports.getRegister = (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.userRole === 'admin' ? '/admin/dashboard' : '/venues');
  }
  res.render('auth/register', {
    title: 'Register',
    layout: 'layouts/auth'
  });
};

// POST /register
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      req.session.error = 'All fields are required.';
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.session.error = 'Password must be at least 6 characters.';
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.session.error = 'Passwords do not match.';
      return res.redirect('/register');
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.session.error = 'An account with this email already exists.';
      return res.redirect('/register');
    }

    // Create user (always organiser role via registration)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'organiser'
    });

    await user.save();

    // Auto-login
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    req.session.success = 'Registration successful! Welcome aboard.';
    return res.redirect('/venues');
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      req.session.error = 'An account with this email already exists.';
    } else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      req.session.error = messages.join(' ');
    } else {
      req.session.error = 'An error occurred. Please try again.';
    }
    return res.redirect('/register');
  }
};

// POST /logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
};
