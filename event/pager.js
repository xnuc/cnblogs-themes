import {Fetch} from "../net/fetch"
import {Timeout} from "../util/timeout"
import {Lock, Sign, Unlock} from "../util/register"
import {Query} from "../util/query"

function indexPagerFetch(url) {
    return Fetch(url, async rsp => {
        const _pager = rsp.match(/>\s*?<div class="pager">([\s\S]*?)<\/div>\s/)
        if (!_pager) return {page: 1, cur: 1}
        return getPage(_pager[1])
    })
}

export async function IndexPager(timeout) {
    const p = indexPagerFetch("https://www.cnblogs.com/ashdyed/default.html?page=2")
    const t = Timeout(timeout, {timeout})
    return await Promise.race([p, t])
}

export async function IndexPagerHandle() {
    const flag = "pager"
    Lock(`_${flag}`)
    const page = await IndexPager(1000)
    Sign(flag)
    Unlock(`_${flag}`)
    return page
}

export async function PagerHandle(pager, timeout) {
    if (!pager) return {page: 1, cur: 1}
    const _pager = pager.innerHTML
    if (!_pager) return {page: 1, cur: 1}
    return getPage(_pager)
}

function getPage(pager) {
    const _page = pager.matchAll(/[0-9]+/g)
    const pages = []
    Array.from(_page).forEach(e => pages.push(parseInt(e[0])))
    pages.sort((e1, e2) => e1 - e2)
    const param = (parseInt(Query("page", "1")) < 1 || !parseInt(Query("page", "1"))) ? 1 : parseInt(Query("page", "1"))
    const page = parseInt(pages[pages.length - 1])
    const cur = param > page ? page : param
    return {page, cur}
}
