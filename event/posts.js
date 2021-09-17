import {Fetch} from "../net/fetch"
import {Config} from "../config/config"
import {Timeout} from "../util/timeout"

const topToken = "[置顶]"
const postDistinct = true
export var CodeHighlightEngineURL
export var CodeHighlightStyleURL

export async function PostsHandle(post, edit, timeout = Config.timeout) {
    const f = posts(post, edit)
    return await Promise.race([Timeout(timeout, []), f])
}

async function postsByFetch(url) {
    const rsp = await Fetch(url)
    codeHighlight(rsp)
    const _desc = rsp.match(/>\s*?<br class="more">([\s\S]*?)<br class="more">\s/)
        ?? rsp.match(/>\s*?<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">([\s\S]*?)<br class="more">\s/)
        ?? rsp.match(/\s*?<div id="cnblogs_post_description" style="display: none">([\s\S]*?)<\/div>\s/)
        ?? rsp.match(/name="description" content="([\s\S]*?)">\s/)
    const _content = rsp.match(/\s*?<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">([\s\S]*?)<\/div>\s<div class="clear">/)
    const _date = rsp.match(/\s*?<span id="post-date">([\s\S]*?)<\/span>/)
    const _readCnt = rsp.match(/\s*?<span id="post_view_count">([\s\S]*?)<\/span>/)
    const _commentCnt = rsp.match(/\s*?<span id="post_comment_count">([\s\S]*?)<\/span>/)
    const desc = _desc[1].trim()
    const content = _content[1].trim()
    const date = new Date(_date[1].trim()).getTime()
    const readCnt = _readCnt[1].trim()
    const commentCnt = _commentCnt[1].trim()
    return {url, desc, content, date, readCnt, commentCnt}
}

async function tagAndCategoryFetch(url, key) {
    const categories = []
    const tags = []
    const rsp = await Fetch(url)
    const tagAndCategory = Array.from(rsp.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g))
    tagAndCategory.filter(e => e[1].indexOf("/category/") !== -1).forEach(e => {
        categories.push({url: e[1], name: e[2]})
    })
    tagAndCategory.filter(e => e[1].indexOf("/tag/") !== -1).forEach(e => {
        tags.push({url: e[1], name: e[2]})
    })
    return {url: key, tags, categories}
}

function isTop(e) {
    if (e.title.indexOf(topToken) === 0) return true
    if (e.title.indexOf(topToken) !== 0) return false
}

async function posts(postEle, editEle) {
    const urlLoaders = []
    const postsMap = {}

    for (let idx = 0; idx < Math.min(postEle.length, editEle.length); idx++) {
        const post = postEle[idx]
        const edit = editEle[idx]
        const postID = edit.href.match(/[0-9].*/)[0]
        const url = post.href
        const title = post.innerText.trim()
        if (postsMap[url] && postDistinct) continue
        const p = postsByFetch(url)
        const c = tagAndCategoryFetch(
            `//www.cnblogs.com/${Config.currentBlogApp}/ajax/CategoriesTags.aspx?blogId=${Config.currentBlogId}&postId=${postID}`, url)
        urlLoaders.push(p, c)
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

function codeHighlight(r) {
    if (CodeHighlightEngineURL && CodeHighlightStyleURL) return
    const _codeHighlightEngineURL = r.match(/<script src="([\S]*?)" async onload="markdown_highlight\(\)"><\/script>/)
    const _codeHighlightStyleURL = r.match(/<link type="text\/css" rel="stylesheet" href="\/css\/prismjs([\s\S]*?)" \/>/)
        ?? r.match(/<link type="text\/css" rel="stylesheet" href="\/css\/hljs([\s\S]*?)" \/>/)
    CodeHighlightEngineURL = _codeHighlightEngineURL[1]
    CodeHighlightStyleURL = Config.codeHighlightEngine === 2 ? `//www.cnblogs.com/css/prismjs${_codeHighlightStyleURL[1]}`
        : `//www.cnblogs.com/css/hljs${_codeHighlightStyleURL[1]}`
}