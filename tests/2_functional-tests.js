const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issue = require("../model/Issue");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let requester;
  suiteSetup(function startServer() {
    requester = chai.request(server).keepOpen();
  });
  suiteTeardown(function closeServer() {
    requester.close(() => {
      console.log("Server connection closed.");
    });
  });

  suite("POST to /api/issues/{project}", function () {
    test("successfully create an issue with every field", (done) => {
      requester
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          issue_text: "text",
          created_by: "me",
          assigned_to: "you",
          status_text: "status",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.issue_title, "test");
          assert.strictEqual(res.body.issue_text, "text");
          assert.strictEqual(res.body.created_by, "me");
          assert.strictEqual(res.body.assigned_to, "you");
          assert.strictEqual(res.body.status_text, "status");
          done();
        });
    });
    test("successfully create an issue with only required fields", (done) => {
      requester
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          issue_text: "text",
          created_by: "me",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.issue_title, "test");
          assert.strictEqual(res.body.issue_text, "text");
          assert.strictEqual(res.body.created_by, "me");
          assert.isEmpty(res.body.assigned_to);
          assert.isEmpty(res.body.status_text);
          done();
        });
    });
    test("reject issue with missing required fields", (done) => {
      requester
        .post("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "test",
          created_by: "me",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET to /api/issues/{project}", function () {
    test("successfully returns all project issues", (done) => {
      requester.get("/api/issues/apitest").end((err, res) => {
        assert.isArray(res.body);
        assert.strictEqual(res.body.length, 2);
        done();
      });
    });
    test("successfully returns project issues filtered by one query", (done) => {
      requester.get("/api/issues/apitest?assigned_to=you").end((err, res) => {
        assert.isArray(res.body);
        assert.strictEqual(res.body.length, 1);
        done();
      });
    });
    test("successfully returns project issues filtered by multiple queries", (done) => {
      requester
        .get("/api/issues/apitest?assigned_to=you&created_by=someone")
        .end((err, res) => {
          assert.isArray(res.body);
          assert.strictEqual(res.body.length, 0);
          done();
        });
    });
  });
  suite("PUT to /api/issues/{project}", function () {
    let _id;
    suiteSetup(async function getId() {
      const res = await requester.get("/api/issues/apitest");
      _id = res.body[0]._id;
    });
    test("successfully updates one field", (done) => {
      requester
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id,
          issue_text: "updated",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.result, "successfully updated");
          assert.strictEqual(res.body._id, _id);
          done();
        });
    });
    test("successfully updates multiple fields", (done) => {
      requester
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id,
          issue_text: "updated again",
          status_text: "oh no",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.result, "successfully updated");
          assert.strictEqual(res.body._id, _id);
          done();
        });
    });
    test("rejects when missing _id", (done) => {
      requester
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_text: "updated again",
          status_text: "oh no",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "missing _id");
          done();
        });
    });
    test("rejects when no fields to update", (done) => {
      requester
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id,
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "no update field(s) sent");
          assert.strictEqual(res.body._id, _id);
          done();
        });
    });
    test("rejects when invalid _id", (done) => {
      requester
        .put("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "beepboop",
          issue_text: "oh no",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "could not update");
          assert.strictEqual(res.body._id, "beepboop");
          done();
        });
    });
  });
  suite("DELETE to /api/issues/{project}", function () {
    let _id;
    suiteSetup(async function getId() {
      const res = await requester.get("/api/issues/apitest");
      _id = res.body[0]._id;
    });
    test("successfully deletes an issue", (done) => {
      requester
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id,
        })
        .end((err, res) => {
          assert.strictEqual(res.body.result, "successfully deleted");
          assert.strictEqual(res.body._id, _id);
          done();
        });
    });
    test("rejects missing _id", (done) => {
      requester
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_text: "oh no",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "missing _id");
          done();
        });
    });
    test("rejects invalid _id", (done) => {
      requester
        .delete("/api/issues/apitest")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: "leeloo",
        })
        .end((err, res) => {
          assert.strictEqual(res.body.error, "could not delete");
          assert.strictEqual(res.body._id, "leeloo");
          done();
        });
    });
  });
});
