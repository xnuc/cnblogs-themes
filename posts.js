import {Fetch} from "./fetch";
import {Timeout} from "./timeout";
import {HasElement, IsLock, IsSign, Lock, Sign, Unlock} from "./register";

const topTitle = "[置顶]"
const postDistinct = true
const posts = []

const lock = "_posts"
const sign = "posts"

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

export async function Posts(postSelector, editSelector, timeout) {
    const urlLoaders = []
    const postsMap = {}
    const postEle = document.querySelectorAll(postSelector)
    const editEle = document.querySelectorAll(editSelector)

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
    if (IsSign(sign) || IsLock(lock) || !HasElement("body #main .postTitle .postTitle2") || !HasElement("body #main .postDesc a"))
        return
    Lock(lock)
    await Posts("body #main .postTitle .postTitle2", "body #main .postDesc a", 1000)
    Sign(sign)
    Unlock(lock)
    console.debug(sign, posts)
}
