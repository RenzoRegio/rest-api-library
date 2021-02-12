const bcrypt = require("bcryptjs");
const auth = require("basic-auth");
const { User } = require("../db").models;

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
  let message;
  const credentials = auth(req);
  if (credentials) {
    const user = await User.findOne({
      where: { emailAddress: credentials.name },
    });
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        req.currentUser = user;
        console.log(`Authentication was successful for ${user.emailAddress}`);
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `Unable to find the user with the username: ${credentials.name}`;
    }
  } else {
    message = "Auth Header Not Found";
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};
