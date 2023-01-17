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

const new_Request_406_NotAcceptable = (body: string) => new Response(body, {status: 406});
const new_Request_500_InternalServerError = (body: string) => new Response(body, {status: 500});

// https://www.rssboard.org/rss-validator/docs/warning/UnexpectedContentType.html
const new_Request_200_OK = (body: string) => new Response(body, {
    status: 200,
    headers: {'Content-Type': 'application/xml'}
});

// https://blog.cloudflare.com/zh-cn/workers-javascript-modules-zh-cn/
import {Feed} from "feed";

// https://www.npmjs.com/package/ts-md5
import {Md5} from "ts-md5";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

        // https://community.cloudflare.com/t/parse-url-query-strings-with-cloudflare-workers/90286/2
        const {searchParams} = new URL(request.url);
        let parcelNos = searchParams.get("parcelNos");

        if (parcelNos === null) {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
            return new_Request_406_NotAcceptable("URL Query String `parcelNos` is required. ");
        }

        // https://stackoverflow.com/questions/6603015/check-whether-a-string-matches-a-regex-in-js
        if (!new RegExp("^[0-9]{13}$").test(parcelNos)) {
            return new_Request_406_NotAcceptable("`parcelNos` should be 13 digits. ")
        }

        const ID = "https://www.zhonghuanus.com";
        const LINK = `${ID}/logistics/getLogistics?parcelNos=${parcelNos}`;

        // https://developers.cloudflare.com/workers/runtime-apis/fetch/
        const resp = await fetch(LINK);
        if (!resp.ok) {
            return new_Request_500_InternalServerError("Upstream request not ok. ");
        }

        const json = await resp.json();

        // @ts-ignore
        if (json.code !== 200) {
            return new_Request_500_InternalServerError("Upstream API status not ok. ");
        }

        // https://github.com/jpmonette/feed
        const feed = new Feed({
            id: `${ID}`,
            copyright: "Vanilla",

            title: `zhonghuanus ${parcelNos}`
        });

        const GITHUB_LINK = "https://github.com/Vanilla-s-Lab/zhonghuanus";

        // @ts-ignore
        for (const logisticsVo of json.data[0].logisticsVoList) {
            feed.addItem({
                link: `${GITHUB_LINK}`,

                title: logisticsVo.content,
                date: new Date(logisticsVo.optDate),

                guid: new Md5()
                    .appendStr(logisticsVo.content)
                    .appendStr(logisticsVo.optDate)
                    .end() as string
            });
        }

        return new_Request_200_OK(feed.rss2());
    },
};
