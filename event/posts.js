import {Fetch} from "../net/fetch"
import {Timeout} from "../util/timeout"
import {IsLock, IsSign, Lock, Sign, Unlock} from "../util/register"

const topTitle = "[置顶]"
const postDistinct = true

function postsFetch(url) {
    return Fetch(url, async rsp => {
        const _desc = rsp.match(/>\s*?<br class="more">([\s\S]*?)<br class="more">\s/)
            ?? rsp.match(/>\s*?<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">([\s\S]*?)<br class="more">\s/)
            ?? rsp.match(/<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>/)
            ?? rsp.match(/name="description" content="([\s\S]*?)"/)
        const _content = rsp.match(/<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">([\s\S]*?)<\/div>\s<div class="clear">/)
        const _date = rsp.match(/<span id="post-date">([\s\S]*?)<\/span>/)
        const _readCnt = rsp.match(/<span id="post_view_count">([\s\S]*?)<\/span>/)
        const _commentCnt = rsp.match(/<span id="post_comment_count">([\s\S]*?)<\/span>/)
        const desc = _desc[1].trim()
        const content = _content[1].trim()
        const date = new Date(_date[1].trim()).getTime()
        const readCnt = _readCnt[1].trim()
        const commentCnt = _commentCnt[1].trim()
        return {url, desc, content, date, readCnt, commentCnt}
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
    return [
        ...Object.values(postsMap).filter(e => isTop(e)).sort(byUnix),
        ...Object.values(postsMap).filter(e => !isTop(e)).sort(byUnix)
    ]
}

export async function PostsHandle(post, edit) {
    const flag = "posts"
    Lock(`_${flag}`)
    const posts = await Posts(post, edit, 1000);
    Sign(flag)
    Unlock(`_${flag}`)
    return posts
}

export async function IndexHandle() {
    const flag = "posts"
    const postEle = Array.from(document.querySelectorAll("body #main .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main .postDesc a"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    const posts = await PostsHandle(flag, postEle, editEle)
    console.info(flag, posts)
}

export async function PostHandle() {
    const flag = "post"
    const postEle = Array.from(document.querySelectorAll("body #main #post_detail .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main #post_detail .postDesc a")).filter(e => e.innerText === "编辑")
    const contentEle = Array.from(document.querySelectorAll("body #main #post_detail #cnblogs_post_body"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0 || contentEle.length === 0)
        return
    const posts = await PostsHandle(flag, postEle, editEle)
    posts[0] = {...posts[0], content: contentEle[0].innerHTML.trim()}
    console.info(flag, posts[0])
}

export async function PAndTagHandle() {
    const flag = "posts"
    const postEle = Array.from(document.querySelectorAll("body #main .PostList .vertical-middle"))
    const editEle = Array.from(document.querySelectorAll("body #main .PostList .postDesc2 a"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    const posts = await PostsHandle(flag, postEle, editEle);
    console.info(flag, posts)
}

export async function CategoriesAndArchivesHandle() {
    const flag = "posts"
    const postEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemTitle"))
    const editEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemPostDesc a")).filter(e => e.innerText === "编辑")
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    const posts = await PostsHandle(flag, postEle, editEle);
    console.info(flag, posts)
}
