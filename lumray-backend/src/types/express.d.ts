// Express v5 types changed ParamsDictionary to `string | string[]` and ParsedQs
// to complex nested types. Override both to match how our controllers use them.
declare module 'express-serve-static-core' {
    interface ParamsDictionary {
        [key: string]: string
    }
    interface Request {
        query: Record<string, string | undefined>
    }
}

export {}
