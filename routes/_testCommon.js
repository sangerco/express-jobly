"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");

const jobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await Job.createJob({
    title: "j1",
    salary: 100000,
    equity: 0.750,
    companyHandle: "c1"
  });
  await Job.createJob({
    title: "j2",
    salary: 75000,
    equity: 0.500,
    companyHandle: "c2"
  });
  await Job.createJob({
    title: "j3",
    salary: 50000,
    equity: 0.000,
    companyHandle: "c3"
  });

  const job1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
  const job2 = await db.query(`SELECT id FROM jobs WHERE title = 'j2'`);
  const job3 = await db.query(`SELECT id FROM jobs WHERE title = 'j3'`);

  jobIds.push(job1.rows[0].id);
  jobIds.push(job2.rows[0].id);
  jobIds.push(job3.rows[0].id);

  console.log(jobIds);
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


const u1Token = createToken({ username: "u1", isAdmin: true });
const u2Token = createToken({ username: "u2", isAdmin: false });
const u3Token = createToken({ username: "u3", isAdmin: false });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
  jobIds
};
