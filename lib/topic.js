let url = require("url");
let qs = require("querystring");
let db = require("./db");
let template = require("./template.js");
let sanitizeHtml = require("sanitize-html");

exports.home = function (request, response) {
  db.query(`SELECT * FROM topic`, function (error, topics) {
    let title = "Welcome";
    let description = "Hello , Node.js";
    let list = template.list(topics);
    let html = template.HTML(
      sanitizeHtml(title),
      list,
      `<h2>${title}</h2><p>${description}</p>`,
      `<a href="/create">create</a>
      <form action="?search=" method="get">
        <input type="text" name="search" placeholder="search"> <input type="submit" value="검색">
      </form>
        `
    );
    response.writeHead(200);
    response.end(html);
  });
};

exports.page = function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function (error, topics) {
    if (error) {
      throw error;
    }
    let query = db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,
      [queryData.id],
      function (error2, topic) {
        if (error2) {
          throw error2;
        }
        let title = topic[0].title;
        let description = topic[0].description;
        let list = template.list(topics);
        let html = template.HTML(
          sanitizeHtml(title),
          list,
          `<h2>${sanitizeHtml(title)}</h2>
          ${sanitizeHtml(description)}
          <p>by ${sanitizeHtml(topic[0].name)}</p>
          `,
          ` <a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까');">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form>`
        );
        response.writeHead(200);
        response.end(html);
      }
    );
  });
};

exports.create = function (request, response) {
  db.query(`SELECT * FROM topic`, function (error, topics) {
    db.query("SELECT * FROM author", function (error2, authors) {
      let title = "Create";
      let list = template.list(topics);
      let html = template.HTML(
        sanitizeHtml(title),
        list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
              <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            ${template.authorSelect(authors)}
          </p>
          <p>
              <input type="submit">
          </p>
        </form>
      `,
        `<a href="/create">create</a>`
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
        INSERT INTO topic (title, description, created, author_id)
          VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

exports.update = function (request, response) {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function (error, topics) {
    if (error) {
      throw error;
    }
    db.query(
      `SELECT * FROM topic WHERE id=?`,
      [queryData.id],
      function (error2, topic) {
        if (error2) {
          throw error2;
        }
        db.query("SELECT * FROM author", function (error2, authors) {
          let list = template.list(topics);
          let html = template.HTML(
            sanitizeHtml(topic[0].title),
            list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${
                sanitizeHtml(topic[0].title)
              }"></p>
              <p>
                <textarea name="description" placeholder="description">${
                  sanitizeHtml(topic[0].description)
                }</textarea>
              </p>
              <p>
                ${template.authorSelect(authors, topic[0].author_id)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      }
    );
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
      "UPDATE topic SET title=?, description=?, author_id=? WHERE id=?",
      [post.title, post.description, post.author, post.id],
      function (error, result) {
        response.writeHead(302, { Location: `/?id=${post.id}` });
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
      "DELETE FROM topic WHERE id=?",
      [post.id],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/` });
        response.end();
      }
    );
  });
};
