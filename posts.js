import {Fetch} from "./fetch";
import {Timeout} from "./timeout";

const topTitle = "[置顶]"
const postDistinct = true

function postsFetch(url) {
    return Fetch(url, async rsp => {
        const _desc = rsp.match(/<br class="_more">([\s\S]*?)<br class="_more">/)
            ?? rsp.match(/<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>/)
            ?? rsp.match(/name="description" content="([\s\S]*?)">/)
        const _date = rsp.match(/<span id="post-date">([\s\S]*?)<\/span>/)
        const _readCnt = rsp.match(/<span id="post_view_count">([\s\S]*?)<\/span>/)
        const _commentCnt = rsp.match(/<span id="post_comment_count">([\s\S]*?)<\/span>/)
        const desc = _desc[1].trim().replace(/\n/g, "")
        const date = new Date(_date[1].trim()).getTime()
        const readCnt = _readCnt[1].trim()
        const commentCnt = _commentCnt[1].trim()
        return {url, desc, date, readCnt, commentCnt}
    })
}

async function tagAndCategoryFetch(url, key) {
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
        return {url: key, tags, categories}
    })
}

function isTop(e) {
    if (e.title.indexOf(topTitle) === 0) return true
    if (e.title.indexOf(topTitle) !== 0) return false
}

export async function Posts(postSelector, editSelector, timeout) {
    const urlLoaders = []
    const posts = {}
    const postEle = document.querySelectorAll(postSelector)
    const editEle = document.querySelectorAll(editSelector)

    for (let idx = 0; idx < Math.min(postEle.length, editEle.length); idx++) {
        const post = postEle[idx]
        const edit = editEle[idx]
        const postID = edit.href.match(/[0-9].*/)[0]
        const url = post.href
        const title = post.innerText.trim()
        if (posts[url] && postDistinct) continue
        const p = postsFetch(url)
        const c = tagAndCategoryFetch(
            `//www.cnblogs.com/${currentBlogApp}/ajax/CategoriesTags.aspx?blogId=${currentBlogId}&postId=${postID}`, url)
        const t = Timeout(timeout, {url})
        urlLoaders.push(Promise.race([p, t]))
        urlLoaders.push(Promise.race([c, t]))
        posts[url] = {url, title, postID}
    }

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