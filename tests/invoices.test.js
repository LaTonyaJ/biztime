process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let invoices;
let companies;
beforeEach(async() => {
    const compResults = await db.query(`INSERT INTO companies (code, name, description) VALUES ('aero', 'Aeropostale', 'Teen Jeans') RETURNING code, name, description`);
    
    const invResults = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('aero', 600) RETURNING id, comp_code, amt, paid, add_date, paid_date`);


    invoices = invResults.rows;
    companies = compResults.rows[0];
    console.log(`Inserting data invoices:${invoices.length} companies:${companies.length}`);
})

afterEach(async() => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
    console.log("Deleting data");

})

afterAll(async()=> {
    await db.end();
})

describe('Invoice Routes', () => {

    test('Get all invoices', async() => {
        const results = await request(app).get('/invoices');
        expect(results.status).toBe(200);
        console.log(`Results:`, results.body);
        expect(results.body.invoices.length).toEqual(invoices.length);
    })

    test('Get a single invoice', async() => {
        const results = await request(app).get(`/invoices/${invoices[0].id}`);
        expect(results.status).toBe(200);
        expect(results.body).toBeInstanceOf(Object);
    })

    test('Get invalid invoice', async() => {
        const results = await request(app).get(`/invoices/99`);
        expect(results.status).toBe(404);
    })

    test('Add an invoice', async() => {
        const results = await request(app).post(`/invoices`).send({
            comp_code: "aero",
            amt: 200,        
        });
        expect(results.status).toBe(201);
        expect(results.body).toBeInstanceOf(Object);
    })

    test('Add Invalid invoice', async() => {
        const results = await request(app).post(`/invoices`).send({});
        expect(results.status).toBe(404);
    })

    test('Update a invoice', async() => {
        const results = await request(app).put(`/invoices/${invoices[0].id}`).send({
            comp_code: 'aero',
            amt: 500,
            paid: true
        });
        expect(results.status).toBe(200);
    })

    test('Delete invoice', async() => {
        const results = await request(app).delete(`/invoices/1`);
        expect(results.status).toBe(200);
        expect(results.body).toEqual({status: "Deleted"})
    })
})