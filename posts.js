import {Fetch} from "./fetch";
import {Timeout} from "./timeout";

async function dFetch(url) {
    return Fetch(url, rsp => {
        const _desc = rsp.match(/<br class="_more">([\s\S]*?)<br class="_more">/)
            ?? rsp.match(/<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>/)
            ?? rsp.match(/<meta name="description" content="([\s\S]*?)" \/>/)
        const _date = rsp.match(/<span id="post-date">([\s\S]*?)<\/span>/)
        const desc = _desc[1].trim().replace(/\n/g, "")
        const date = new Date(_date[1].trim()).getTime()
        return {url, desc, date}
    })
}

export async function Posts(selector, timeout) {
    const urlLoaders = []
    const posts = {}
    document.querySelectorAll(selector).forEach(e => {
        const url = e.href
        const title = e.innerText.trim()
        const f = dFetch(url)
        const t = Timeout(timeout, {url})
        urlLoaders.push(Promise.race([f, t]))
        posts[url] = {url, title}
    })
    const postInfos = await Promise.all(urlLoaders)
    postInfos.forEach(info => {
        posts[info.url] = {...posts[info.url], ...info}
    })
    return Object.values(posts).sort((e1, e2) => {
        return e2.date - e1.date
    })
}
