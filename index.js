const wrapper = function() {
    if (process['isBun']) {
        return require("bun:sqlite").Database
    }

    return require("better-sqlite3")
}

module.exports = wrapper()
