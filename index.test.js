const assert = require('assert').strict
const it = function() {
    return process['isBun'] ? test : require('node:test').it
}()

it('should load underling lib', () => {
    //when
    const Database = require('./index')
    const db = new Database(":memory:")
    db.pragma('journal_mode = WAL')
    const query = db.prepare("select 'Hello world' as message;")

    //then
    assert.deepEqual(query.get(), {message: 'Hello world'})
})
