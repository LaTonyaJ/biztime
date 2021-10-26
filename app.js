const express = require('express');
const ExpressError = require('./expressError');
const invoiceRoutes = require('./routes/invoices');
const companyRoutes = require('./routes/companies');


const app = express();

app.use(express.json());

app.use('/invoices', invoiceRoutes);

app.use('/companies', companyRoutes);


app.use((error, req, res, next) => {
    const err = new ExpressError("Not Found", 404);
    return next(err);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);

    return res.json({
        message: error.message,
        error: error
    })
})

module.exports = app;