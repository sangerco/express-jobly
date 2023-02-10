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
            RETURNING title, salary, equity, company_handle AS "companyHandle"`,
            [title, salary, equity, companyHandle]);
        const job = result.rows[0];
        return job;
    }

    static async findAllJobs(data = {}) {
        // create base query and empty arrays to build on extra
        // query params if necessary
        let query = `SELECT title, salary, equity,
                        company_handle AS "companyHandle"
                        FROM jobs`;
        const paramsArr = [];
        const valuesArr = [];
        // push title value into values array, use array length to
        // notate position for query string
        if(data.title) {
            valuesArr.push(`%${data.title}%`);
            paramsArr.push(`title ILIKE $${valuesArr.length}`);
        }
        // same with minSalary
        if(data.minSalary){
            valuesArr.push(data.minSalary);
            paramsArr.push(`salary >= $${valuesArr.length}`);
        }
        // if equity query is passed through as boolean
        // add query string for equity values greater than zero
        if(data.equity === true){
            paramsArr.push(`equity > 0`);
        }
        // if items in params array, join with AND string
        // append to base query 
        if(paramsArr.length > 0) {
            query += ` WHERE ` + paramsArr.join(` AND `)
        }
        // append order string to final query
        query += ` ORDER BY title`;
        const jobsRes = await db.query(query, valuesArr);
        return jobsRes.rows;
    }
    
    static async getJob(id) {
        const result = await db.query(`
                SELECT title, salary, equity,
                company_handle AS "companyHandle"
                FROM jobs
                WHERE id = $1`,
                [id]);

        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);    
        return job;
    }

    static async updateJob(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              companyHandle: "company_handle"
            });
        const idVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING title, 
                                    salary, 
                                    equity, 
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);
    
        return job;
      }
    
    static async deleteJob(id) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE id = $1
               RETURNING title`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }

}


module.exports = Job;