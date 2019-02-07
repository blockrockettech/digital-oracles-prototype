const functions = require('firebase-functions');
const winston = require('winston');
const expressWinston = require('express-winston');

const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

app.use(cors({origin: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Simple logger
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true
}));

const contract = require('./api/routes/contract');
const chain = require('./api/routes/chain');

app.use('/contracts', contract);
app.use('/chain', chain);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    if (err.name === 'GasToHighError') {
        return res.status(400).json({
            error: 'GAS_TO_HIGH'
        });
    }
    res.status(500).send({
        error: err.name,
        stack: err.stack
    });
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);
