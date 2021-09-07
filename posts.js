import {Fetch} from "./fetch";
import {Timeout} from "./timeout";

const topTitle = "[置顶]"
const postDistinct = true

function postsFetch(url) {
    return Fetch(url, async rsp => {
        const _desc = rsp.match(/<br class="_more">([\s\S]*?)<br class="_more">/)
            ?? rsp.match(/<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>/)
            ?? rsp.match(/<meta name="description" content="([\s\S]*?)" \/>/)
        const _date = rsp.match(/<span id="post-date">([\s\S]*?)<\/span>/)
        const _readCnt = rsp.match(/<span id="post_view_count">([\s\S]*?)<\/span>/)
        const _commentCnt = rsp.match(/<span id="post_comment_count">([\s\S]*?)<\/span>/)
        const _postID = rsp.match(/var cb_entryId = (.*?),/)
        const _blogID = rsp.match(/cb_blogId = (.*?),/)
        const _blogApp = rsp.match(/cb_blogApp = '(.*?)',/)
        const desc = _desc[1].trim().replace(/\n/g, "")
        const date = new Date(_date[1].trim()).getTime()
        const readCnt = _readCnt[1].trim()
        const commentCnt = _commentCnt[1].trim()
        const postID = _postID[1].trim()
        const blogID = _blogID[1].trim()
        const blogApp = _blogApp[1].trim()
        const tagAndCategory = await tagAndCategoryFetch(
            `//www.cnblogs.com/${blogApp}/ajax/CategoriesTags.aspx?blogId=${blogID}&postId=${postID}`)
        return {url, desc, date, readCnt, commentCnt, postID, blogID, blogApp, ...tagAndCategory}
    })
}

async function tagAndCategoryFetch(url) {
    return Fetch(url, rsp => {
        const tagAndCategory = Array.from(rsp.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g))
        const categories = []
        tagAndCategory.filter(e => e[1].indexOf("/category/") !== -1).forEach(e => {
            categories.push({url: e[1], name: e[2]})
        })
        const tags = []
        tagAndCategory.filter(e => e[1].indexOf("/tag/") !== -1).forEach(e => {
            tags.push({url: e[1], name: e[2]})
        })
        return {tags, categories}
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
        const f = postsFetch(url)
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