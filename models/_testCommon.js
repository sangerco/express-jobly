const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let jobIds = []

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  await db.query(`
        INSERT INTO jobs(title, salary, equity, company_handle)
        VALUES  ('j1', '100000', '0.750', 'c1'),
                ('j2', '75000', '0.500', 'c2'),
                ('j3', '50000', '0.000', 'c3')`);
  
  const job1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
  const job2 = await db.query(`SELECT id FROM jobs WHERE title = 'j2'`);

  jobIds.push(job1.rows[0].id);
  jobIds.push(job2.rows[0].id);

  await db.query(`INSERT INTO applications (username, job_id)
                    VALUES ('u1', $1), ('u2', $2)
                    RETURNING username, job_id`,
                    [jobIds[0], jobIds[1]]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
};