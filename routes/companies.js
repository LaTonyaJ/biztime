const db = require('../db');
const express = require('express');
const ExpressError = require('../expressError');
const router = new express.Router();
const slugify = require('slugify');

router.get('/', async(req, res, next) => {
    try{
        const result = await db.query(`SELECT * FROM companies`);
        return res.json({"companies": result.rows}) 
    }
    catch (e){
        return next(e);
    }
})

router.get('/:code', async(req, res, next) => {
    try{
        let ccode = req.params.code;

        const c = await db.query(`SELECT c.code, c.name, c.description, i.industry FROM companies AS c LEFT JOIN comp_industry AS ci ON c.code = ci.comp_code LEFT JOIN industries AS i ON i.code = ci.ind_code WHERE c.code=$1`, [ccode]);

        const i = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [ccode]);

        if(c.rows.length === 0){
            console.log('Code not Found');
            throw new ExpressError(`${ccode} code not Found`, 404);
        }

        let {code, name, description} = c.rows[0];
        // let invoices = i.rows;

        let industries = c.rows.map(r => r.industry);
        invoices = i.rows.map(inv => inv.id);

        return res.json({"company": {code, name, description, industries, invoices}});
                                            
    }catch(e){
        console.log('ErrorFound', e);
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {name, description} = req.body;
        const code = slugify(`${req.body.name}`, {lower:true, remove: /[*+~.()'"!:@]/});

        const company = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({"company": company.rows[0]});

    }catch(e){
        return next(e);
    }
})

router.put('/:code', async(req, res, next) => {
    try{
        let {name, description} = req.body;

        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, req.params.code]);
        if(result.rows.length === 0){
            throw new ExpressError(`Invalid comapny code: ${req.params.code}`, 404);
        }
        return res.json({"company": result.rows[0]});
    }catch(e){
        next(e);
    }
})

router.delete('/:code', async(req, res, next) => {
    try{
        const code =req.params.code;

        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        
        return res.json({status: "Deleted"});

    }catch(e){
        next(e);
    }
})


module.exports = router;