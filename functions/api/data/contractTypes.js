const _ = require('lodash');

const ContractState = {
    Blank: 0,       // not set
    Pending: 1,     // pending awaiting details
    Approved: 2,    // approved, details received
    Terminated: 3,  // terminated the contract
    Replaced: 4     // replaced by new contract
};

const ContractDuration = {
    Blank: 0,       // not set
    Indefinite: 1,  // indefinitely until termination
    FixedTerm: 2    // based on project start/end
};

const PaymentFrequency = {
    Blank: 0,               // not set
    HourlyRate: 1,          // A set hourly rate
    Daily: 2,               // invoiceable daily
    Weekly: 3,              // invoiceable weekly
    Monthly: 4,             // invoiceable monthly
    Yearly: 5,              // invoiceable yearly
    OnCompletion: 6,        // when work is complete
    PercentageUpFront: 7,   // a percentage upfront, remaining on completion
    OnDate: 8,              // On a specific date
    OneOff: 9               // A one off payment
};

const ClientPaymentTerms = {
    Blank: 0,       // not set
    UponReceipt: 1, // when receipt is received
    WithXDays: 2    // within a certain number of days
};

const InvoiceStatus = {
    Blank: 0,
    Pending: 1,
    Paid: 2,
    Refunded: 3,
    Delayed: 4
};

module.exports = {
    ContractState,
    ContractDuration,
    PaymentFrequency,
    ClientPaymentTerms,
    InvoiceStatus,
    fromEnumString(enumType, field) {
        const convertedValue = enumType[field];
        if (!convertedValue) {
            throw new Error(`Expected one of [${_.keys(enumType)}]] - got [${field}]`);
        }
        return convertedValue;
    },
    toEnumString(enumType, rawValue) {
        const found = _.findKey(enumType, (value, key) => {
            if (_.toNumber(value) === _.toNumber(rawValue)) {
                return key;
            }
        });
        if (!found) {
            throw new Error(`Expected one of [${_.values(enumType)}] - got [${rawValue}]`);
        }
        return found;
    }
};
