import {Fetch} from "./fetch";
import {Timeout} from "./timeout";

const topTitle = "[置顶]"
const postDistinct = true

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

function isTop(e) {
    if (e.title.indexOf(topTitle) === 0) return true
    if (e.title.indexOf(topTitle) !== 0) return false
}

export async function Posts(selector, timeout) {
    const urlLoaders = []
    const posts = {}
    document.querySelectorAll(selector).forEach(e => {
        const url = e.href
        const title = e.innerText.trim()
        if (posts[url] && postDistinct) return
        const f = dFetch(url)
        const t = Timeout(timeout, {url})
        urlLoaders.push(Promise.race([f, t]))
        posts[url] = {url, title}
    })
    const postInfos = await Promise.all(urlLoaders)
    postInfos.forEach(info => {
        posts[info.url] = {...posts[info.url], ...info}
    })
    const byUnix = (p, n) => n.date - p.date
    return [
        ...Object.values(posts).filter(e => isTop(e)).sort(byUnix),
        ...Object.values(posts).filter(e => !isTop(e)).sort(byUnix)
    ]
}
