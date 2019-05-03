class Response {
  constructor(code, body, cookies = {}) {
    this.code = code;
    this.body = body;
    this.cookies = cookies;
  }

  respond(res) {
    res.status(this.code);
    Object.keys(this.cookies).forEach(name =>
      res.cookie(name, this.cookies[name].value, this.cookies[name].options)
    )
    res.json(this.body);
  }
}

module.exports = {
  Response
}
