
[![CI](https://github.com/farjs/better-sqlite3-wrapper/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/farjs/better-sqlite3-wrapper/actions/workflows/ci.yml?query=workflow%3Aci+branch%3Amain)
[![npm version](https://img.shields.io/npm/v/@farjs/better-sqlite3-wrapper)](https://www.npmjs.com/package/@farjs/better-sqlite3-wrapper)
[![Rate on Openbase](https://badges.openbase.com/js/rating/@farjs/better-sqlite3-wrapper.svg)](https://openbase.com/js/@farjs/better-sqlite3-wrapper?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

## @farjs/better-sqlite3-wrapper

Thin api wrapper around [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
and [bun:sqlite](https://bun.sh/docs/api/sqlite) to allow cross- runtime/engine usage.

It exposes only [a subset](./index.d.ts) of `better-sqlite3` api because not everything
is available in `bun:sqlite`. For example, since `run` returns `undefined`
you can use the following query to get `lastInsertRowid`:

```javascript
const lastInsertRowId = db.prepare("SELECT last_insert_rowid() AS id;").get().id;
```
