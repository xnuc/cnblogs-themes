import {Fetch} from "./fetch";
import {Timeout} from "./timeout";
import {IsLock, IsSign, Lock, Sign, Unlock} from "./register";

const topTitle = "[置顶]"
const postDistinct = true
const posts = []

const postsLock = "_posts"
const postsSign = "posts"
const postLock = "_post"
const postSign = "post"

function postsFetch(url) {
    return Fetch(url, async rsp => {
        const _desc = rsp.match(/>\s*?<br class="more">([\s\S]*?)<br class="more">\s/)
            ?? rsp.match(/>\s*?<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">([\s\S]*?)<br class="more">\s/)
            ?? rsp.match(/<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>/)
            ?? rsp.match(/name="description" content="([\s\S]*?)"/)
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

export async function Posts(postEle, editEle, timeout) {
    const urlLoaders = []
    const postsMap = {}

    for (let idx = 0; idx < Math.min(postEle.length, editEle.length); idx++) {
        const post = postEle[idx]
        const edit = editEle[idx]
        const postID = edit.href.match(/[0-9].*/)[0]
        const url = post.href
        const title = post.innerText.trim()
        if (postsMap[url] && postDistinct) continue
        const p = postsFetch(url)
        const c = tagAndCategoryFetch(
            `//www.cnblogs.com/${currentBlogApp}/ajax/CategoriesTags.aspx?blogId=${currentBlogId}&postId=${postID}`, url)
        const t = Timeout(timeout, {url})
        urlLoaders.push(Promise.race([p, t]))
        urlLoaders.push(Promise.race([c, t]))
        postsMap[url] = {url, title, postID}
    }

    const postInfos = await Promise.all(urlLoaders)
    postInfos.forEach(info => {
        postsMap[info.url] = {...postsMap[info.url], ...info}
    })
    const byUnix = (p, n) => n.date - p.date
    posts.push(
        ...Object.values(postsMap).filter(e => isTop(e)).sort(byUnix),
        ...Object.values(postsMap).filter(e => !isTop(e)).sort(byUnix)
    )
}

export async function PostsHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main .postDesc a"))
    if (IsSign(postsSign) || IsLock(postsLock) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(postsLock)
    await Posts(postEle, editEle, 1000)
    Sign(postsSign)
    Unlock(postsLock)
    console.debug(postsSign, posts)
}

export async function PostHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main #post_detail .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main #post_detail .postDesc a")).filter(e => e.innerText === "编辑")
    if (IsSign(postSign) || IsLock(postLock) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(postLock)
    await Posts(postEle, editEle, 1000)
    Sign(postSign)
    Unlock(postLock)
    console.debug(postSign, posts)
}
