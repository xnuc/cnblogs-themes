import {UpdateHandles} from "../event/dom"
import {PostsHandle, CodeHighlightEngineURL, CodeHighlightStyleURL} from "../event/posts"
import {IsLock, IsSign, Lock, Sign, Unlock} from "../util/register";
import {IndexPagerHandle, PagerHandle} from "../event/pager";
import {Load} from "../util/load"


(async _ => {
    const paths = window.location.pathname.split("/").filter(e => e !== '')
    while (paths.shift() !== currentBlogApp && paths.length !== 0) {
    }
    paths.push("")
    switch (paths[0]) {
        case "tag":
            if (paths.shift()) UpdateHandles.push(TagHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
            break
        case "p":
            if (paths.shift()) UpdateHandles.push(PostHandle)
            if (!paths.shift()) UpdateHandles.push(PHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
            break
        case "category":
            UpdateHandles.push(CategoryHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
            break
        default:
            UpdateHandles.push(IndexHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
    }
})()

async function IndexHandle() {
    const flag = "index"
    const postEle = Array.from(document.querySelectorAll("body #main .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main .postDesc a"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const sites = Sites()
    const res = await Promise.all([PostsHandle(postEle, editEle), IndexPagerHandle()])
    const index = {sites, posts: res[0], pager: res[1]}
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info("index", index)
    await IndexDOM(index)
}

async function IndexDOM(index) {
    const theme = document.createElement("div")
    theme.classList.add("blog-theme")
    const body = document.querySelector("body")
    headerDOM(index.sites, theme)
    PostsDOM(index.posts, theme)
    PagerDOM(index.pager, `${index.sites.url}default.html`, theme)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    if (codeHighlightEngine === 1) {
        Load(`//www.cnblogs.com/css/hljs${CodeHighlightStyleURL[1]}`, "css")
        Load(CodeHighlightEngineURL, "js", async () => {
            document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        })
    }
    if (codeHighlightEngine === 2) {
        Load(`//www.cnblogs.com/css/prismjs${CodeHighlightStyleURL[1]}`, "css")
        Load(CodeHighlightEngineURL, "js", async () => {
            Prism.highlightAll()
        })
    }
}

async function PHandle() {
    const flag = "p"
    const postEle = Array.from(document.querySelectorAll("body #main .PostList .vertical-middle"))
    const editEle = Array.from(document.querySelectorAll("body #main .PostList .postDesc2 a"))
    const pagerEle = Array.from(document.querySelectorAll("body #main .Pager"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const sites = Sites()
    const posts = await PostsHandle(postEle, editEle)
    const pager = await PagerHandle(pagerEle[0], 1000)
    const p = {sites, posts, pager}
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info("p", p)
    await PDOM(p)
}

async function PDOM(p) {
    const theme = document.createElement("div")
    theme.classList.add("blog-theme")
    const body = document.querySelector("body")
    headerDOM(p.sites, theme)
    PostsDOM(p.posts, theme)
    PagerDOM(p.pager, `${p.sites.url}p/`, theme)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    Load(CodeHighlightEngineURL, async () => {
        Prism.highlightAll()
    })
    // document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
}

async function CategoryHandle() {
    const flag = "category"
    const postEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemTitle"))
    const editEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemPostDesc a")).filter(e => e.innerText === "编辑")
    const pagerEle = Array.from(document.querySelectorAll("body #main .pager"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const sites = Sites()
    const posts = await PostsHandle(postEle, editEle)
    const pager = await PagerHandle(pagerEle[0], 1000)
    const category = {sites, posts, pager}
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info("category", category)
    await CategoryDOM(category)
}

async function CategoryDOM(category) {
    const theme = document.createElement("div")
    const body = document.querySelector("body")
    headerDOM(category.sites, theme)
    PostsDOM(category.posts, theme)
    PagerDOM(category.pager, `//${window.location.host}${window.location.pathname}`, theme)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    await markdown_highlight()
    document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
}

async function TagHandle() {
    const flag = "category"
    const postEle = Array.from(document.querySelectorAll("body #main .PostList .vertical-middle"))
    const editEle = Array.from(document.querySelectorAll("body #main .PostList .postDesc2 a"))
    const pagerEle = Array.from(document.querySelectorAll("body #main .Pager"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const sites = Sites()
    const posts = await PostsHandle(postEle, editEle)
    const pager = await PagerHandle(pagerEle[0], 1000)
    const tag = {sites, posts, pager}
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info("tag", tag)
    await TagDOM(tag)
}

async function TagDOM(tag) {
    const theme = document.createElement("div")
    theme.classList.add("blog-theme")
    const body = document.querySelector("body")
    headerDOM(tag.sites, theme)
    PostsDOM(tag.posts, theme)
    PagerDOM(tag.pager, `//${window.location.host}${window.location.pathname}default.html`, theme)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    await markdown_highlight()
    document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
}


function Sites() {
    const url = document.querySelectorAll("body #header #blogTitle h1 a")[0].href
    const title = document.querySelectorAll("body #header #blogTitle h1")[0].innerText.trim()
    const subtitle = document.querySelectorAll("body #header #blogTitle h2")[0].innerText.trim()
    return {title, subtitle, url};
}

async function PostHandle() {
    const flag = "post"
    const postEle = Array.from(document.querySelectorAll("body #main #post_detail .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main #post_detail .postDesc a")).filter(e => e.innerText === "编辑")
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const sites = Sites()
    const posts = await PostsHandle(postEle, editEle)
    const post = {sites, post: posts[0]}
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info(flag, post)
    await PostDOM(post)
}

async function PostDOM(post) {
    const theme = document.createElement("div")
    theme.classList.add("blog-theme")
    const body = document.querySelector("body")
    headerDOM(post.sites, theme)
    const tags = document.createElement("span")
    post.post.tags.forEach(tag => {
        tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
    })
    const categories = document.createElement("span")
    post.post.categories.forEach(category => {
        categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
    })
    const article = document.createElement("div")
    article.innerHTML = `<article class=" "><h3 class="article-title"><a href="${post.post.url}"><span>${post.post.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${post.post.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(post.post.date)}">${new Date(post.post.date).toLocaleString()}</time></a></span></div><div class="article-content"><div class="entry">${post.post.content}</div></div><div class="article-footer"><div class="article-meta pull-left">${tags.outerHTML}${categories.outerHTML}</div></div></article>`
    theme.appendChild(article)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    Load(CodeHighlightEngineURL, "js", async () => {
        Prism.highlightAll()
    })
    // document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
}

function headerDOM(sites, body) {
    const brand = document.createElement("div")
    brand.innerHTML = `<div class="site-branding"><h1 class="site-title"><a href="${sites.url}">${sites.title}</a></h1><p class="site-description">${sites.subtitle}</p></div>`
    body.appendChild(brand)
    const navigation = document.createElement("div")
    navigation.innerHTML = `<nav class="site-navigation"><ul><li><a href="${sites.url}">主页</a></li><li><a href="${sites.url}p/">归档</a></li></ul></nav>`
    body.appendChild(navigation)
}

function PagerDOM(pager, url, body) {
    const _pager = document.createElement("div")
    if (pager.cur !== 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur - 1}"><</a><a href="${url}?page=1">1</a>`
    if (pager.cur - 1 > 2) _pager.innerHTML += `...`
    if (pager.cur - 1 > 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur - 1}">${pager.cur - 1}</a>`
    _pager.innerHTML += `<a href="${url}?page=${pager.cur}">${pager.cur}</a>`
    if (pager.page - pager.cur > 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur + 1}">${pager.cur + 1}</a>`
    if (pager.page - pager.cur > 2) _pager.innerHTML += `...`
    if (pager.cur !== pager.page) _pager.innerHTML += `<a href="${url}?page=${pager.page}">${pager.page}</a><a href="${url}?page=${pager.cur + 1}">></a>`
    body.appendChild(_pager)
}

function PostsDOM(posts, body) {
    const articles = document.createElement("div")
    posts.forEach(e => {
        const tags = document.createElement("span")
        tags.classList.add("post-tags")
        e.tags.forEach(tag => {
            tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
        })
        const categories = document.createElement("span")
        categories.classList.add("post-categories")
        e.categories.forEach(category => {
            categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
        })
        articles.innerHTML += `<article><h3 class="article-title"><a href="${e.url}"><span>${e.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${e.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(e.date)}">${new Date(e.date).toLocaleString()}</time></a></span></div><div class="article-content"><div class="entry">${e.desc}</div></div><div class="article-footer"><div class="article-meta pull-left">${tags.outerHTML}${categories.outerHTML}</div></div></article>`
    })
    body.appendChild(articles)
}
