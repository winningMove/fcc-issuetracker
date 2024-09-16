"use strict";
const Issue = require("../model/Issue");

module.exports = function (app) {
  // db modeled as object w/ project string keys and array of issues values
  const projects = {};

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;

      if (projects[project] === undefined) return res.json([]);

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

      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      const issue = new Issue(
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      );
      (projects[project] = projects[project] || []).push(issue);

      res.json(issue.getPlain());
    })

    .put(function (req, res) {
      const project = req.params.project;

      if (!req.body._id) return res.json({ error: "missing _id" });

      const { _id, ...fieldsToUpdate } = req.body;

      const updates = Object.fromEntries(
        Object.entries(fieldsToUpdate).filter(([k, v]) => v !== "")
      );
      if (Object.keys(updates).length === 0)
        return res.json({ error: "no update field(s) sent", _id });

      const issue = projects[project].find((issue) => issue._id === _id);
      if (!issue) return res.json({ error: "could not update", _id });

      issue.update(updates);

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
