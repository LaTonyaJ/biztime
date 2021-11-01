const db = require('../db');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');


router.get('/', async(req, res, next) => {
    try{
        const result = await db.query(`SELECT * FROM invoices`);
        return res.json({"invoices": result.rows}) 
    }
    catch (e){
        return next(e);
    }
})

router.get('/:id', async(req, res, next) => {
    try{
        let id = req.params.id;

        const results = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date, name, description FROM invoices
        INNER JOIN companies ON (invoices.comp_code = companies.code) WHERE id=$1`, [id]);

        if(results.rows.length === 0){
            throw new ExpressError(`Invoice not Found`, 404);
        }

        const data = results.rows[0];

        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date, 
        };
        return res.json({"invoice": invoice});
                                            
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        if(!req.body){
            throw new ExpressError(`Invalid Invoice body`, 404);
        }
        const {comp_code, amt} = req.body;

        const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({"invoice": invoice.rows[0]});

    }catch(e){
        return next(e);
    }
})

router.put('/:id', async(req, res, next) => {
    console.log('In Update');

    try{
        const id = req.params.id;
        let {amt, paid} = req.body;
        let paidDate = null;

        const currStatus = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [id]);

        if(currStatus.rows.length === 0){
            console.log('Couldnt find invoice');
            throw new ExpressError(`Invoice Not Found`, 404);
        }

        const currDate = currStatus.rows[0].paid_date;

        if(!currDate && paid){
            paidDate = new Date();
        }else if(!paid){
            paidDate = null;
        }else{
            paidDate = currDate;
        }

        const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);
        if(result.rows.length === 0){
            console.log('Invalid invoice');
            throw new ExpressError(`Invalid invoice`, 404);
        }
        return res.json({"invoice": result.rows[0]});
    }catch(e){
        console.log('Error Found', e);
        next(e);
    }
})

router.delete('/:id', async(req, res, next) => {
    try{
        const id = req.params.id;

        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        
        return res.json({status: "Deleted"});

    }catch(e){
        next(e);
    }
})

module.exports = router;
