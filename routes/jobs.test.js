"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  jobIds
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// test create new job

describe("POST /jobs", () => {
    const newJob = {
        title: "new job",
        salary: 100000,
        equity: "0.100",
        companyHandle: "c1"
    };

    test("create new job as admin", async () => {
        const resp = await request(app)
                        .post('/jobs')
                        .send(newJob)
                        .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "job": {
                "title": "new job",
                "salary": 100000,
                "equity": "0.100",
                "companyHandle": "c1"
            }
        })
    });

    test("cannot create new job as user", async () => {
        const resp = await request(app)
                        .post('/jobs')
                        .send(newJob)
                        .set("authorization", `Bearer ${u2Token}`);     
        expect(resp.statusCode).toBe(401);   
    });

    test("cannot create new job as anon", async () => {
        const resp = await request(app)
                        .post('/jobs')
                        .send(newJob)    
        expect(resp.statusCode).toBe(401);   
    });    
})

describe("GET /jobs", () => {
    test("find all jobs", async () => {
        const resp = await request(app).get("/jobs");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: 'j1',
                    salary: 100000,
                    equity: "0.75",
                    companyHandle: "c1"
                },
                {
                    title: 'j2',
                    salary: 75000,
                    equity: "0.5",
                    companyHandle: "c2"
                },
                {
                    title: 'j3',
                    salary: 50000,
                    equity: null,
                    companyHandle: "c3"
                }
            ]
        });
    });

    test("find job by minimum salary", async () => {
        const resp = await request(app)
                        .get("/jobs")
                        .query({ minSalary: 80000 });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            jobs: [
                {                    
                    title: 'j1',
                    salary: 100000,
                    equity: "0.75",
                    companyHandle: "c1"
                }
            ]
        });
    });

    test("find job by title", async () => {
        const resp = await request(app)
                        .get("/jobs")
                        .query({ title: 'j1' });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            jobs: [
                {                    
                    title: 'j1',
                    salary: 100000,
                    equity: "0.75",
                    companyHandle: "c1"
                }
            ]
        });
    });

    test("find job by equity", async () => {
        const resp = await request(app)
                        .get("/jobs")
                        .query({ equity: true });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: 'j1',
                    salary: 100000,
                    equity: "0.75",
                    companyHandle: "c1"
                },
                {
                    title: 'j2',
                    salary: 75000,
                    equity: "0.5",
                    companyHandle: "c2"
                }
            ]
        });
    });
})

describe("GET /job", () => {
    test("get job by id", async () => {
        const resp = await request(app).get(`/jobs/${jobIds[0]}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            job: {
                title: 'j1',
                salary: 100000,
                equity: "0.75",
                companyHandle: "c1"                
            }
        });
    });

    test("fail for id that doesn't exist", async () => {
        const badId = 0;
        const resp = await request(app).get(`/jobs/${badId}`);    
        expect(resp.statusCode).toBe(404);
        expect(resp.body).toEqual({
            "error": {
                "message": `No job: ${badId}`,
                "status": 404
            }
        });    
    });
})

describe("PATCH /job", () => {
    test("update job as admin", async () => {
        const resp = await request(app)
                .patch(`/jobs/${jobIds[0]}`)
                .send({
                    title: "new title",
                    salary: 199999,
                    equity: "0.222"
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            job: {
                "title": "new title",
                "salary": 199999,
                "equity": "0.222",
                "companyHandle": "c1"
            }
        });
    });

    test("fails as user", async () => {
        const resp = await request(app)
                    .patch(`/jobs/${jobIds[0]}`)
                    .send({
                        title: "new title",
                        salary: 199999,
                        equity: "0.222"
                    })
                    .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
        expect(resp.body).toEqual({ 
            error: { 
                message: 'Unauthorized', 
                status: 401 
            }
        });
    });

    test("fails as anon", async () => {
        const resp = await request(app)
                    .patch(`/jobs/${jobIds[0]}`)
                    .send({
                        title: "new title",
                        salary: 199999,
                        equity: "0.222"
                    })
        expect(resp.statusCode).toBe(401);
        expect(resp.body).toEqual({ 
            error: { 
                message: 'Unauthorized', 
                status: 401 
            }
        });
    });
})

describe("DELETE /job", () => {
    test("delete job as admin", async () => {
        const resp = await request(app)
                        .delete(`/jobs/${jobIds[2]}`)
                        .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "message": `Job: ${jobIds[2]} deleted`
        });
    });

    test("fails as user", async () => {
        const resp = await request(app)
                        .delete(`/jobs/${jobIds[2]}`)
                        .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
        expect(resp.body).toEqual({ 
            error: { 
                message: 'Unauthorized', 
                status: 401 
            } 
        });
    });

    test("fails as anon", async () => {
        const resp = await request(app)
                        .delete(`/jobs/${jobIds[2]}`)
        expect(resp.statusCode).toBe(401);
        expect(resp.body).toEqual({ 
            error: { 
                message: 'Unauthorized', 
                status: 401 
            } 
        });
    });
})