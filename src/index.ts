/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

        // https://community.cloudflare.com/t/parse-url-query-strings-with-cloudflare-workers/90286/2
        const {searchParams} = new URL(request.url);
        let parcelNos = searchParams.get("parcelNos");

        if (parcelNos === null) {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
            return new Response("URL Query String `parcelNos` is required. ", {status: 406});
        }

        // https://stackoverflow.com/questions/6603015/check-whether-a-string-matches-a-regex-in-js
        if (!new RegExp("^[0-9]{13}$").test(parcelNos)) {
            return new Response("`parcelNos` should be 13 digits. ", {status: 406})
        }

        return new Response("Hello World!");
    },
};
