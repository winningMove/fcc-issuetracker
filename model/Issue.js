module.exports = class Issue {
  constructor(
    issue_title,
    issue_text,
    created_by,
    assigned_to = "",
    status_text = ""
  ) {
    this._id = Math.floor(Math.random() * 100_000).toString();
    this.issue_title = issue_title;
    this.issue_text = issue_text;
    this.created_by = created_by;
    this.assigned_to = assigned_to;
    this.status_text = status_text;
    this.created_on = new Date().toISOString();
    this.updated_on = this.created_on;
    this.open = true;
  }

  update(updates) {
    Object.keys(updates).forEach((k) => {
      if (Object.hasOwn(this, k)) {
        this[k] = k === "open" && updates[k] === "false" ? false : updates[k];
      }
    });
    this.updated_on = new Date().toISOString();
  }

  getPlain() {
    return Object.assign({}, this);
  }
};
