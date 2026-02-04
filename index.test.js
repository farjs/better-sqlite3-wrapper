const Database = require("./index");
const os = require("os");
const fs = require("fs");
const path = require("path");

const assert = require("assert").strict;
const it = (function () {
  return process["isBun"] ? test : require("node:test").it;
})();

it("should open in-memory database", () => {
  //when
  const db = new Database(":memory:");
  const query = db.prepare("select 'Hello world' as message;");

  //then
  assert.deepEqual({ ...query.get() }, { message: "Hello world" });

  //when & then
  const results = query.all();
  assert.deepEqual(Array.isArray(results), true);
  assert.deepEqual(
    results.map((r) => {
      return { ...r };
    }),
    [{ message: "Hello world" }],
  );

  //when & then
  db.close();
});

it("should create file-based database", () => {
  //given
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "better-sqlite3-wrapper-"),
  );
  const file = path.join(tmpDir, "test.db");
  let db = new Database(file);
  const changesQuery = db.prepare("SELECT changes() AS changes;");
  const lastInsertRowIdQuery = db.prepare("SELECT last_insert_rowid() AS id;");

  //when
  const [changes, lastInsertRowId] = db.transaction(() => {
    db.prepare(
      `
            create table test(
                id     integer primary key,
                name   text not null
            );
        `,
    ).run();
    const insert = db.prepare("insert into test (name) values (?);");
    insert.run("test1");
    insert.run("test2");
    return [changesQuery.get().changes, lastInsertRowIdQuery.get().id];
  })();

  //then
  assert.deepEqual(changes, 1);
  assert.deepEqual(lastInsertRowId, 2);
  db.close();
  assert.deepEqual(fs.existsSync(file), true);

  //when
  db = new Database(file, { readonly: true });
  const results = db.prepare("select * from test order by id;").all();

  //then
  assert.deepEqual(
    results.map((r) => {
      return { ...r };
    }),
    [
      {
        id: 1,
        name: "test1",
      },
      {
        id: 2,
        name: "test2",
      },
    ],
  );

  //cleanup
  db.close();
  fs.unlinkSync(file);
  fs.rmdirSync(tmpDir);
});

it("should rollback failed transaction", () => {
  //when
  const db = new Database(":memory:");
  const changesQuery = db.prepare("SELECT changes() AS changes;");
  const lastInsertRowIdQuery = db.prepare("SELECT last_insert_rowid() AS id;");
  db.prepare(
    `
          create table test(
              id     integer primary key,
              name   text not null
          );
      `,
  ).run();
  assert.deepEqual(changesQuery.get().changes, 0);
  assert.deepEqual(lastInsertRowIdQuery.get().id, 0);

  const error = Error("test error");
  const txFn = db.transaction((name) => {
    const insert = db.prepare("insert into test (name) values (?);");
    insert.run(name);
    throw error;
  });
  let caughtError = null;

  //when
  try {
    txFn("test1");
  } catch (err) {
    caughtError = err;
  }

  //then
  assert.deepEqual(caughtError === error, true);
  assert.deepEqual(changesQuery.get().changes, 1);
  assert.deepEqual(lastInsertRowIdQuery.get().id, 1);

  //when & then
  const query = db.prepare("select id, name from test;");
  assert.deepEqual(
    query.all().map((r) => {
      return { ...r };
    }),
    [],
  );

  //cleanup
  db.close();
});
