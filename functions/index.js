const functions = require('firebase-functions');
const winston = require('winston');
const expressWinston = require('express-winston');

const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

app.use(cors());
app.options('*', cors({origin: false}));

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
const invoice = require('./api/routes/invoice');
const chain = require('./api/routes/chain');
const fake = require('./api/routes/fakeNegotiationApi');

app.use('/contracts', contract);
app.use('/invoices', invoice);
app.use('/chain', chain);
app.use('/fake/negotiate', fake);

// N.B: final param needed - do not remove
app.use(function (err, req, res, _) {
    if (err.name === 'GasToHighError') {
        return res.status(400).json({
            success: false,
            error: 'GAS_TO_HIGH'
        });
    } else if (err instanceof Error) {
        res.status(500).json({
            success: false,
            error: err.name,
            message: err.message
        });
    } else {
        res.status(500).json({
            success: false,
            ...err
        });
    }
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);
