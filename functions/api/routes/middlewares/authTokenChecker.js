const functions = require('firebase-functions');

/**
 * A very basic header validation middleware for protecting express routes.
 */
module.exports = function authTokenChecker(req, res, next) {

    const authTokenKey = functions.config().authtoken.key;

    // Sense check we have setup the environment
    if (!authTokenKey) {
        return res
            .status(500)
            .json({message: 'authtoken.key not configured in environment'});
    }

    const authToken = req.header('X-Auth-Token');

    // Validate the header has been provider on the request
    if (!authToken || authToken !== authTokenKey) {
        return res
            .status(401)
            .json({message: 'Missing [X-Auth-Token] Header or the correct key'});
    }

    next();
};
