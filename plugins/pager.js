import {Fetch} from "../net/fetch"
import {Timeout} from "../util/timeout"
import {Query} from "../util/query"
import {Config} from "../config/config"

export async function IndexPagerHandle(timeout = Config.timeout) {
    const f = pageByFetch(`//www.cnblogs.com/${Config.currentBlogApp}/default.html?page=2`)
    return await Promise.race([Timeout(timeout, {page: 1, cur: 1}), f])
}

export function PagerHandle(pagerHTML) {
    if (!pagerHTML) return {page: 1, cur: 1}
    return pager(pagerHTML)
}

async function pageByFetch(url) {
    const rsp = await Fetch(url)
    const _pager = rsp.match(/>\s*?<div class="pager">([\s\S]*?)<\/div>\s/)
    if (_pager) return pager(_pager[1])
    else return {page: 1, cur: 1}
}

function pager(pagerHTML) {
    const pages = []
    const _pages = pagerHTML.matchAll(/[0-9]+/g)
    Array.from(_pages).forEach(e => pages.push(parseInt(e[0])))
    pages.sort((e1, e2) => e1 - e2)
    const curPage = parseInt(Query("page", 1))
    const maxPage = pages[pages.length - 1]
    return {cur: curPage, page: maxPage}
}
