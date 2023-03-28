const wrapper = function() {
    if (process['isBun']) {
        const bunDbCtor = require("bun:sqlite").Database
        const ctor = function(...args) {
            const db = new bunDbCtor(...args)
            if (!db.pragma) {
                db.pragma = function() {}
            }
            return db
        }
        return ctor
    }

    return require("better-sqlite3")
}

module.exports = wrapper()
