import {Fetch} from "../net/fetch"
import {Timeout} from "../util/timeout"
import {Lock, Sign, Unlock} from "../util/register"
import {Query} from "../util/query"

function pagerFetch(url) {
    return Fetch(url, async rsp => {
        const _pager = rsp.match(/>\s*?<div class="pager">([\s\S]*?)<\/div>\s/)
        if (!_pager) return {page: parseInt("1"), cur: parseInt("1")}
        const _page = _pager[1].matchAll(/[0-9]+/g)
        const pages = []
        Array.from(_page).forEach(e => pages.push(e[0]))
        pages.sort()
        const cur = Query("page", "1")
        return {page: parseInt(pages[pages.length - 1]), cur: parseInt(cur)}
    })
}

export async function Pager(timeout) {
    const p = pagerFetch("https://www.cnblogs.com/ashdyed/default.html?page=2")
    const t = Timeout(timeout, {timeout})
    return await Promise.race([p, t])
}

export async function PagerHandle() {
    const flag = "pager"
    Lock(`_${flag}`)
    const page = await Pager(1000)
    Sign(flag)
    Unlock(`_${flag}`)
    return page
}