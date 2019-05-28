class Response {
  constructor(code, body, cookies = {}) {
    this.code = code;
    this.body = body;
    this.cookies = cookies;
  }

  setCookies(res) {
    Object.keys(this.cookies).forEach(name =>
      res.cookie(name, this.cookies[name].value, this.cookies[name].options)
    )
  }

  respond(res) {
    res.status(this.code);
    this.setCookies(res);
    res.json(this.body);
  }
}

class RedirectResponse extends Response {
  constructor(url, cookies) {
    super(302, url, cookies);
  }

  respond(res) {
    this.setCookies(res);
    res.redirect(this.body);
  }
}

module.exports = {
  Response,
  RedirectResponse
}
