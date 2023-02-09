"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe('Create job', () => {
    const newJob = {
        title: "New Job",
        salary: 75000,
        equity: 0.100,
        companyHandle: 'c1'
    };

    test('create new job', async () => {
        const job = await Job.createJob(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(`SELECT title, salary, 
                                        equity, company_handle AS companyHandle
                                        FROM jobs WHERE title = 'New Job'`);
        expect(result.rows[0]).toEqual([
            {
                title: "New Job",
                salary: 75000,
                equity: 0.100,
                companyHandle: 'c1'
            }
        ]);


    });
})

describe('Find jobs', () => {
    test('get all jobs, no filter', async () => {
        const jobs = await Job.findAllJobs();
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 100000,
                equity: 0.750,
                companyHandle: 'c1'
            },
            {
                title: 'j2',
                salary: 75000,
                equity: 0.500,
                companyHandle: 'c2'
            },
            {
                title: 'j3',
                salary: 50000,
                equity: 0.000,
                companyHandle: 'c3'
            }
        ]);
    });

    test('get job with title filter', async () => {
        const data = { title: 'j1'};
        const job = await Job.findAllJobs(data);
        expect(job).toEqual([
            {
                title: 'j1',
                salary: 100000,
                equity: 0.750,
                companyHandle: 'c1'
            }
        ]);
    });

    test('get jobs with salary filter', async () => {
        const data = { minSalary: 50001 };
        const jobs = await Job.findAllJobs(data);
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 100000,
                equity: 0.750,
                companyHandle: 'c1'
            },
            {
                title: 'j2',
                salary: 75000,
                equity: 0.500,
                companyHandle: 'c2'
            }            
        ]);
    });

    test('get jobs with equity filter', async () => {
        const data = { hasEquity: true };
        const jobs = await Job.findAllJobs(data);
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 100000,
                equity: 0.750,
                companyHandle: 'c1'
            },
            {
                title: 'j2',
                salary: 75000,
                equity: 0.500,
                companyHandle: 'c2'
            }            
        ]);        
    });
})

describe("get jobs", () => {
    test('get jobs by title', async () => {
        const job = await Job.getJob('j1');
        expect(job).toEqual([
            {
                title: 'j1',
                salary: 100000,
                equity: 0.750,
                companyHandle: 'c1'
            }
        ])
    });

    test("fail if job doesn't exist", async () => {
        try {
            await Job.getJob("nope");
            fail();
          } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
          }
    });
})

describe("update jobs", () => {
    test("update job", async () => {
        const data = {
            title: "new title",
            salary: 150000,
            equity: 0.000,
            companyHandle: "c1",
          };
        const job = await Job.updateJob("j1", data);
        expect(job).toEqual([
            {
                title: "new title",
                salary: 150000,
                equity: 0.000,
                companyHandle: "c1"
            }
        ]);
        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
             FROM companies
             WHERE handle = 'c1'`);
        expect(result.rows).toEqual([
            {
                title: "new title",
                salary: 150000,
                equity: 0.000,
                companyHandle: "c1"
            }
        ]);
    });

    test("fail if job doesn't exist", async () => {
        const data = {
            title: "doesn't matter"
        };
        try {
            await Job.updateJob("j4", data);
            fail();
          } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
          }
    });
})

describe("delete jobs", () => {
    test("delete a job", async () => {
        await Job.deleteJob('j3');
        const result = await db.query(`SELECT title FROM jobs
                                        WHERE title = 'j3'`);
        expect(result.rows.length).toEqual(0);
    });

    test("fail if job doesn't exist", async () => {
        try {
            await Job.deleteJob("j4");
            fail();
          } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
          }
    });
})