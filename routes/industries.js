const db = require('../db');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');

router.get('/', async(req, res, next) => {
    try{
        const results = await db.query(`SELECT code, industry FROM industries`);

        const companies = await db.query(`SELECT c.code, c.name, i.industry FROM companies AS c LEFT JOIN comp_industry AS ci ON c.code = ci.comp_code LEFT JOIN industries AS i ON i.code = ci.ind_code`);

        let industry = results.rows;

        let comps = companies.rows.map(c => c.name);
    

        if(results.rows.length === 0){
            throw new ExpressError('No Industries Found', 404);
        }
        return res.json({'industries': industry});
        
    }catch(e){
        return next(e);
    }
})

router.post('/', async(req, res,next) => {
    try{
        if(!req.body){
            throw new ExpressError(`Invalid Invoice body`, 404);
        }
        let {code, industry} = req.body;

        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1,$2) RETURNING code, industry`,[code, industry]);

        return res.status(201).json({"industry": result.rows[0]})
    }catch(e){
        return next(e);
    }
})

module.exports = router;