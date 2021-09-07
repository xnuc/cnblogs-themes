import {Fetch} from "./fetch";
import {Timeout} from "./timeout";

async function dFetch(url, desc) {
    return Fetch(url, _desc => {
        const match = _desc.match(/<br class="_more">([\s\S]*?)<br class="_more">/)
        desc = match ? match[1].replace(/\n/g, "") : desc
        return {url, desc}
    })
}

export async function Posts(selector, timeout) {
    const _descs = []
    const posts = []
    document.querySelectorAll(selector).forEach(e => {
        const title = e.firstElementChild.innerText
        const url = e.firstElementChild.href
        const desc = e.nextElementSibling.innerText.match(/摘要：([\s\S]*?)阅读全文/)[1]
        const f = dFetch(url, desc)
        const t = Timeout(timeout, {url, desc})
        _descs.push(Promise.race([f, t]))
        posts[url] = {title, url}
    })
    const descs = await Promise.all(_descs)
    descs.forEach(e => {
        posts[e.url] = {...posts[e.url], desc: e.desc}
    })
    return posts.reverse()
}
