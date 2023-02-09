"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    // create a job, update, retrieve job data, and delete a job
    // Use errors if data is incomplete or company doesn't exist
    // return { title, salary, equity, companyHandle }

    static async createJob({ title, salary, equity, companyHandle }) {

        const result = await db.query(`
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle AS companyHandle`,
            [title, salary, equity, companyHandle]);
        const job = result.rows[0];
        return job;
    }

    static async findAllJobs(data) {
        const query = `SELECT title, salary, equity,
                        company_handle AS companyHandle
                        FROM jobs`;
        const paramsArr = [];
        const valuesArr = [];

        const { title, minSalary, hasEquity } = data;

        if(title) {
            valuesArr.push(`%${title}%`);
            paramsArr.push(`title ILIKE ${valuesArr.length}`);
        }
        if(minSalary){
            valuesArr.push(minSalary);
            paramsArr.push(`salary >= ${valuesArr.length}`);
        }
        if(hasEquity){
            valuesArr.push(0.001);
            paramsArr.push(`equity >= ${valuesArr.length}`);
        }

        if(paramsArr.length > 0) {
            query += ` WHERE ` + paramsArr.join(` AND `)
        }

        query += ` ORDER BY title`;

        const jobsRes = await db.query(query, valuesArr);
        return jobsRes.rows;
    }
    
    static async getJob(title) {
        const result = await db.query(`
                SELECT title, salary, equity,
                company_handle AS companyHandle
                FROM jobs
                WHERE title = $1`,
                [title]);

        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${title}`);    
        return job;
    }

    static async updateJob(title, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              companyHandle: "company_handle"
            });
        const titleVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE companies 
                          SET ${setCols} 
                          WHERE title = ${titleVarIdx} 
                          RETURNING title, 
                                    salary, 
                                    equity, 
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, title]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${title}`);
    
        return job;
      }
    
    static async deleteJob(title) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE title = $1
               RETURNING title`,
            [title]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No company: ${title}`);
    }

}


module.exports = Job;