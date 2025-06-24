const wrapper = function () {
  if (process["isBun"]) {
    return require("bun:sqlite").Database;
  }

  if (isModuleAvailable("better-sqlite3")) {
    return require("better-sqlite3");
  }

  const { DatabaseSync } = require("node:sqlite");
  function dbCtor(path, options) {
    if (options) {
      return nodeDbWrapper(new DatabaseSync(path, options));
    }

    return nodeDbWrapper(new DatabaseSync(path));
  }
  return dbCtor;
};

function isModuleAvailable(name) {
  try {
    require.resolve(name);
    return true;
  } catch {}

  return false;
}

function nodeDbWrapper(db) {
  //check if node supports it
  //see: https://github.com/nodejs/node/issues/57431
  if (db.transaction) {
    return db;
  }

  //see: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#transactionfunction---function
  db.transaction = (f) => {
    const doTx = (...args) => {
      try {
        const res = f(...args);
        db.prepare("COMMIT").run();
        return res;
      } catch (error) {
        db.prepare("ROLLBACK").run();
        throw error;
      }
    };

    const txFn = (...args) => {
      db.prepare("BEGIN").run();
      return doTx(...args);
    };
    txFn.deferred = (...args) => {
      db.prepare("BEGIN DEFERRED").run();
      return doTx(...args);
    };
    txFn.immediate = (...args) => {
      db.prepare("BEGIN IMMEDIATE").run();
      return doTx(...args);
    };
    txFn.exclusive = (...args) => {
      db.prepare("BEGIN EXCLUSIVE").run();
      return doTx(...args);
    };

    return txFn;
  };
  return db;
}

module.exports = wrapper();
