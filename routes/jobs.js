"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, checkIfAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

// create job route => must be admin
router.post("/", ensureLoggedIn, checkIfAdmin, async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.createJob(req.body);
      return res.status(201).json({ job });
    } catch (error) {
      return next(error);
    }
  });


//   Find all jobs and find job by title => no log in or privileges necessary
  router.get("/", async (req, res, next) => {
    try {
        // create data variable to pass through to Job model
        const data = req.query;
        // convert "true" string to boolean before passing through to findAllJobs method
        if(data.equity === "true") {
            data.equity = true
        }
        const jobs = await Job.findAllJobs(data);
        return res.json({ jobs });
    }   catch (e) {
        return next(e);
    }
  });

  router.get("/:title", async (req, res, next) => {
    try {
      const job = await Job.getJob(req.params.title);
      return res.json({ job });
    } catch (e) {
      return next(e);
    }
  });

// Update job => must be logged in and admin
router.patch("/:title", ensureLoggedIn, checkIfAdmin, async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.updateJob(req.params.title, req.body);
      return res.json({ job });
    } catch (error) {
      return next(error);
    }
  });

// Delete job => must be logged in and admin
router.delete('/:title', ensureLoggedIn, checkIfAdmin, async (req, res, next) => {
    try {
        await Job.deleteJob(req.params.title);
        return res.json({
            message: `Job: ${req.params.title} deleted`
        })
    } catch (e) {
        return next(e)
    }
});


module.exports = router;