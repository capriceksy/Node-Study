let db = require("./db");
let template = require("./template.js");
let qs = require("querystring");
let url = require("url");
let sanitizeHtml = require("sanitize-html");

exports.home = function (request, response) {
  db.query(`SELECT * FROM topic`, function (error, topics) {
    db.query(`SELECT * FROM author`, function (error, authors) {
      let title = "author";
      let list = template.list(topics);
      let html = template.HTML(
        title,
        list,
        `
                    ${template.authorTable(authors)}
                    <style>
                        table {
                            border-collapse: collapse;
                        }
                        td {
                            border:1px solid black;
                        }
                    </style>
                    <form action="/author/create_process" method="post">
                        <p>
                            <input type="text" name="name" placeholder="name">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="description"></textarea>
                        </p>
                        <p>
                            <input type="submit" value="create">
                        </p>
                    </form>
                `,
        ``
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = function (request, response) {
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    db.query(
      `
          INSERT INTO topic (author, profile)
            VALUES(?, ?)`,
      [post.title, post.description, post.author],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};

exports.update = function (request, response) {
  db.query(`SELECT * FROM topic`, function (error, topics) {
    db.query(`SELECT * FROM author`, function (error2, authors) {
      let _url = request.url;
      let queryData = url.parse(_url, true).query;
      db.query(
        `SELECT * FROM author WHERE id=?`,
        [queryData.id],
        function (error3, author) {
          let title = "author";
          let list = template.list(topics);
          let html = template.HTML(
            title,
            list,
            `
                        ${template.authorTable(authors)}
                        <style>
                            table {
                                border-collapse: collapse;
                            }
                            td {
                                border:1px solid black;
                            }
                        </style>
                        <form action="/author/update_process" method="post">
                            <p>
                                <input type="hidden" name="id" value="${
                                  queryData.id
                                }">
                            </p>
                            <p>
                                <input type="text" name="name" value="${
                                  sanitizeHtml(author[0].name)
                                }" placeholder="name">
                            </p>
                            <p>
                                <textarea name="profile" placeholder="description">${
                                  sanitizeHtml(author[0].profile)
                                }</textarea>
                            </p>
                            <p>
                                <input type="submit" value="update">
                            </p>
                        </form>
                    `,
            ``
          );
          response.writeHead(200);
          response.end(html);
        }
      );
    });
  });
};

exports.update_process = function (request, response) {
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    db.query(
      `UPDATE author SET name=?, profile=? WHERE id=?`,
      [post.name, post.profile, post.id],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};

exports.delete_process = function (request, response) {
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    db.query(
      `DELETE FROM topic WHERE author_id=?`,
      [post.id],
      function (error1, result1) {
        if (error1) {
          throw error1;
        }
        db.query(
          `DELETE FROM author WHERE id=?`,
          [post.id],
          function (error, result) {
            if (error) {
              throw error;
            }
            response.writeHead(302, { Location: `/author` });
            response.end();
          }
        );
      }
    );
  });
};
