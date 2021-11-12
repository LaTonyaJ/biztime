const db = require('../db');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');

//Get All Industries with company codes
router.get('/', async(req, res, next) => {
    try{
        
        const results = await db.query(`SELECT c.code AS company_code, i.code AS industry_code, i.industry AS industry FROM companies AS c RIGHT JOIN comp_industry AS ci ON c.code = ci.comp_code RIGHT JOIN industries AS i ON i.code = ci.ind_code`);

        if(results.rows.length === 0){
            throw new ExpressError('No Industries Found', 404);
        }

        let industry = results.rows;

        return res.json({'industries': industry });
        
    }catch(e){
        return next(e);
    }
})


//Add a new industry
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

//Associate industry and company
router.post('/associate', async(req, res, next) => {
    try{
        let {comp_code, ind_code} = req.body;

        const result = await db.query(`INSERT INTO comp_industry (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code`, [comp_code, ind_code]);

        return res.josn(result.rows[0]);
    }catch(e){
        return next(e);
    }
})

module.exports = router;