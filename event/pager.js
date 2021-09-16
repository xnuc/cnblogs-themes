import {Fetch} from "../net/fetch"
import {Timeout} from "../util/timeout"
import {Query} from "../util/query"
import {Config} from "../config/config";

export async function IndexPagerHandle(timeout = Config.timeout) {
    const f = pageByFetch(`https://www.cnblogs.com/${Config.currentBlogApp}/default.html?page=2`)
    return await Promise.race([Timeout(timeout, {page: 1, cur: 1}), f])
}

export function PagerHandle(pager) {
    if (!pager) return {page: 1, cur: 1}
    return page(pager)
}

async function pageByFetch(url) {
    const rsp = await Fetch(url)
    const _pager = rsp.match(/>\s*?<div class="pager">([\s\S]*?)<\/div>\s/)
    return page(_pager[1])
}

function page(pagerHTML) {
    const pages = []
    const _pages = pagerHTML.matchAll(/[0-9]+/g)
    Array.from(_pages).forEach(e => pages.push(parseInt(e[0])))
    pages.sort((e1, e2) => e1 - e2)
    const curPage = parseInt(Query("page", 1))
    const maxPage = pages[pages.length - 1]
    return {cur: curPage, page: maxPage}
}
