import { Elysia } from "elysia";
export type ServerOptions = {
    routesDir?: string;
    apiDir?: string;
    staticDir?: string;
    port?: number;
    env?: "development" | "production";
};
export declare function createFrameworkServer(opts?: ServerOptions): Promise<{
    app: Elysia<"", {
        decorator: {};
        store: {};
        derive: {};
        resolve: {};
    }, {
        typebox: {};
        error: {};
    }, {
        schema: {};
        standaloneSchema: {};
        macro: {};
        macroFn: {};
        parser: {};
        response: {};
    }, {}, {
        derive: {};
        resolve: {};
        schema: {};
        standaloneSchema: {};
        response: {};
    }, {
        derive: {};
        resolve: {};
        schema: {};
        standaloneSchema: {};
        response: {};
    }>;
    listen: (p?: number) => Elysia<"", {
        decorator: {};
        store: {};
        derive: {};
        resolve: {};
    }, {
        typebox: {};
        error: {};
    }, {
        schema: {};
        standaloneSchema: {};
        macro: {};
        macroFn: {};
        parser: {};
        response: {};
    }, {}, {
        derive: {};
        resolve: {};
        schema: {};
        standaloneSchema: {};
        response: {};
    }, {
        derive: {};
        resolve: {};
        schema: {};
        standaloneSchema: {};
        response: {};
    }>;
}>;
//# sourceMappingURL=createServer.d.ts.map