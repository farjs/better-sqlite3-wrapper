const Database = require('./index')
const os = require('os')
const fs = require('fs')
const path = require('path')

const assert = require('assert').strict
const it = function() {
    return process['isBun'] ? test : require('node:test').it
}()

it('should open in-memory database', () => {
    //when
    const db = new Database(":memory:")
    db.pragma('journal_mode = WAL')
    const query = db.prepare("select 'Hello world' as message;")

    //then
    assert.deepEqual(query.get(), {message: 'Hello world'})

    //when & then
    db.close()
})

it('should create file-based database', () => {
    //given
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "better-sqlite3-wrapper-"))
    const file = path.join(tmpDir, "test.db")
    let db = new Database(file)
    const lastInsertRowIdQuery = db.prepare("SELECT last_insert_rowid() AS id;")

    //when
    const lastInsertRowId = db.transaction(() => {
        db.prepare(`
            create table test(
                id     integer primary key,
                name   text not null
            );
        `).run()
        const insert = db.prepare("insert into test (name) values (?);")
        insert.run("test1")
        insert.run("test2")
        return lastInsertRowIdQuery.get().id
    })()
        
    //then
    assert.deepEqual(lastInsertRowId, 2)
    db.close()
    assert.deepEqual(fs.existsSync(file), true)
    
    //when
    db = new Database(file, { readonly: true })
    const results = db.prepare("select * from test order by id;").all()
    
    //then
    assert.deepEqual(results, [{
        id: 1,
        name: "test1"
    }, {
        id: 2,
        name: "test2"
    }])
    
    //cleanup
    db.close()
    fs.unlinkSync(file)
    fs.rmdirSync(tmpDir)
})
