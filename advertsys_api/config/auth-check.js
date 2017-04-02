var jwt = require('jsonwebtoken');
var Company = require('mongoose').model('Company');


/**
 *  The Auth Checker middleware function.
 */
module.exports = function (req, res, next) {

  // var token = req.headers.authorization.split(' ')[1];
  // return jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
  //   if (err) {
  //     return res.status(401).json({
  //       title: 'Authentication failed',
  //       message: 'Authentication failed',
  //       error: err
  //     })
  //   }
  //   if (!decoded) {
  //     return res.status(403).json({
  //       title: 'Authentication failed',
  //       error: {message: 'Authentication failed'}
  //     });
  //   }
  //   if (decoded) {
  //     return Company.findById(decoded.company._id, function (err, doc) {
  //       if (err) {
  //         return res.status(500).json({
  //           title: 'Fetching user failed',
  //           message: 'Fetching user failed',
  //           err: err
  //         });
  //       }
  //       if (!doc) {
  //         return res.status(404).json({
  //           title: 'The user was not found',
  //           error: {message: 'The user was not found'}
  //         })
  //       }
  //       if (doc) {
  //         return req.company = doc;
  //         next();
  //       }
  //     })
  //   }
  // });

  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  // get the last part from a authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(' ')[1];

  // decode the token using a secret key-phrase
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // the 401 code is for unauthorized status
    if (err) { return res.status(401).end(); }

    const userId = decoded._id;

    // check if a user exists
    return Company.findById(userId, (userErr, company) => {
      if (userErr || !company) {
        return res.status(401).end();
      }
      //req.user = user;
      return next();
    });
  });
};
