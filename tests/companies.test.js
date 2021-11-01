process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let companies;
beforeEach( async() => {
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES
    ('wm', 'Walmart', 'One Stop Shop') RETURNING code, name, description`);

    companies = results.rows[0];
})

afterEach(async() => {
    await db.query(`DELETE FROM companies`);
})

afterAll(async()=> {
    await db.end();
})

describe('Company Routes', () => {

    test('Get all companies', async() => {
        const results = await request(app).get('/companies');
        expect(results.status).toBe(200);
        expect(results.body).toEqual({'companies': [companies]})
    })

    test('Get a company', async() => {
        const results = await request(app).get(`/companies/${companies.code}`);
        expect(results.status).toBe(200);
        expect(results.body).toBeInstanceOf(Object);
    })

    test('Get invalid company', async() => {
        const results = await request(app).get(`/companies/apple`);
        expect(results.status).toBe(404);
    })

    test('Add a company', async() => {
        const results = await request(app).post(`/companies`).send({
            code: 'apple',
            name: 'Macintosh',
            description: 'Top Seller!'
        });
        expect(results.status).toBe(201);
        expect(results.body).toEqual({'company': {code: 'apple', name: 'Macintosh', description: 'Top Seller!'}});
    })

    test('Add Invalid company', async() => {
        const results = await request(app).post(`/companies`).send({
            code: 'apple',
            description: 'Top Seller!'
        });
        expect(results.status).toBe(404);
    })

    test('Update a company', async() => {
        const results = await request(app).put(`/companies/${companies.code}`).send({
            code: 'wm',
            name: 'Wally World',
            description: 'Founded 1950'
        });
        expect(results.status).toBe(200);
        expect(results.body).toEqual({'company': {code: 'wm', name: 'Wally World', description: 'Founded 1950'}});
    })

    test('Delete company', async() => {
        const results = await request(app).delete(`/companies/${companies.code}`);
        expect(results.status).toBe(200);
        expect(results.body).toEqual({status: "Deleted"})
    })
})