// adapted from:
//  https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/better-sqlite3/index.d.ts
// TypeScript Version: 3.8

/// <reference types="node" />

type VariableArgFunction = (...params: any[]) => any;
type ArgumentTypes<F extends VariableArgFunction> = F extends (...args: infer A) => any ? A : never;

declare namespace BetterSqlite3 {

    interface Statement<BindParameters extends any[]> {
        run(...params: BindParameters): undefined;
        get(...params: BindParameters): any;
        all(...params: BindParameters): any[];
    }

    interface Transaction<F extends VariableArgFunction> {
        (...params: ArgumentTypes<F>): ReturnType<F>;
        deferred(...params: ArgumentTypes<F>): ReturnType<F>;
        immediate(...params: ArgumentTypes<F>): ReturnType<F>;
        exclusive(...params: ArgumentTypes<F>): ReturnType<F>;
    }

    interface Database {
        prepare<BindParameters extends any[] | {} = any[]>(
            source: string,
        ): BindParameters extends any[] ? Statement<BindParameters> : Statement<[BindParameters]>;
        transaction<F extends VariableArgFunction>(fn: F): Transaction<F>;
        close(): this;
    }

    interface DatabaseConstructor {
        new (filename: string, options?: Database.Options): Database;
        prototype: Database;

        SqliteError: typeof SqliteError;
    }
}

declare class SqliteError extends Error {
    name: string;
    message: string;
    code: string;
    constructor(message: string, code: string);
}

declare namespace Database {

    interface Options {
        readonly?: boolean | undefined;
    }

    type SqliteError = typeof SqliteError;
    type Statement<BindParameters extends any[] | {} = any[]> = BindParameters extends any[]
        ? BetterSqlite3.Statement<BindParameters>
        : BetterSqlite3.Statement<[BindParameters]>;
    type Transaction<T extends VariableArgFunction = VariableArgFunction> = BetterSqlite3.Transaction<T>;
    type Database = BetterSqlite3.Database;
}

declare const Database: BetterSqlite3.DatabaseConstructor;
export = Database;
