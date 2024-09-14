"use strict";
const Issue = require("../model/Issue");

module.exports = function (app) {
  // db modeled as object w/ project string keys and array of issues values
  const projects = {};

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;

      let toReturn = [...projects[project]];
      if (req.query) {
        Object.keys(req.query).forEach((field) => {
          toReturn = toReturn.filter(
            (issue) => issue[field] === req.query[field]
          );
        });
      }

      res.json(toReturn);
    })

    .post(function (req, res) {
      const project = req.params.project;

      // const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json({ error: "required field(s) missing" });
      }

      const issue = new Issue({ ...req.body });
      (projects[project] = projects[project] || []).push(issue);

      res.json(issue.getPlain());
    })

    .put(function (req, res) {
      const project = req.params.project;

      if (!req.body._id) return res.json({ error: "missing _id" });
      if (Object.keys(req.body).length === 1)
        return res.json({ error: "no update field(s) sent" });

      const issue = projects[project].find(
        (issue) => issue._id === req.body._id
      );
      if (!issue)
        return res.json({ error: "could not update", _id: req.body._id });

      const { _id, ...fieldsToUpdate } = req.body;
      issue.update(fieldsToUpdate);

      res.json({ result: "successfully updated", _id });
    })

    .delete(function (req, res) {
      const project = req.params.project;

      if (!req.body._id) return res.json({ error: "missing _id" });
      const issueIndex = projects[project].findIndex(
        (issue) => issue._id === req.body._id
      );

      if (issueIndex === -1)
        return res.json({ error: "could not delete", _id: req.body._id });
      projects[project].splice(issueIndex, 1);

      res.json({ result: "successfully deleted", _id: req.body._id });
    });
};
