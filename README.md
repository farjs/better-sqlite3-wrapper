
[![CI](https://github.com/farjs/better-sqlite3-wrapper/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/farjs/better-sqlite3-wrapper/actions/workflows/ci.yml?query=workflow%3Aci+branch%3Amain)
[![npm version](https://img.shields.io/npm/v/@farjs/better-sqlite3-wrapper)](https://www.npmjs.com/package/@farjs/better-sqlite3-wrapper)

## @farjs/better-sqlite3-wrapper

Thin api wrapper around [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
and [bun:sqlite](https://bun.sh/docs/api/sqlite) to allow cross- runtime/engine usage.

It exposes only [a subset](./index.d.ts) of `better-sqlite3` api because not everything
is available in `bun:sqlite`.

For example, since `run` returns `undefined` you can use the following queries to get
 `changes` and/or `lastInsertRowid`:

```javascript
const changes = db.prepare("SELECT changes() AS changes;").get().changes;
const lastInsertRowId = db.prepare("SELECT last_insert_rowid() AS id;").get().id;
```
