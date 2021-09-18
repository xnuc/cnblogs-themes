import {UpdateHandles} from "../event/dom"
import {PostsHandle, CodeHighlightEngineURL, CodeHighlightStyleURL} from "../event/posts"
import {Done, EmptyFunc, Sync} from "../util/sync"
import {IndexPagerHandle, PagerHandle} from "../event/pager"
import {Load} from "../util/load"
import {SitesHandle} from "../event/sites"
import {Config} from "../config/config"

(async _ => {
    const paths = window.location.pathname.split("/").filter(e => e !== '')
    while (paths.shift() !== Config.currentBlogApp && paths.length !== 0) {
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
    const postEle = Array.from(document.querySelectorAll("body #main .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main .postDesc a"))
    const flag = "index"
    if (Done(flag) || postEle.length === 0 || editEle.length === 0)
        return
    await Sync(flag, EmptyFunc, async () => {
        const sites = SitesHandle()
        const res = await Promise.all([PostsHandle(postEle, editEle), IndexPagerHandle()])
        const index = {sites, posts: res[0], ...res[1]}
        console.info(flag, index)
        IndexDOM(index)
    }, EmptyFunc)
}

function IndexDOM(index) {
    const theme = document.createElement("div")
    theme.classList.add("theme-blog")
    const body = document.querySelector("body")
    headerDOM(index.sites, theme)
    PostsDOM(index.posts, theme)
    PagerDOM({cur: index.cur, page: index.page}, `${index.sites.url}default.html`, theme)
    body.appendChild(theme)
    codeHighlight()
}

async function PHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main .PostList .vertical-middle"))
    const editEle = Array.from(document.querySelectorAll("body #main .PostList .postDesc2 a"))
    const pagerEle = Array.from(document.querySelectorAll("body #main .Pager"))
    const flag = "p"
    if (Done(flag) || postEle.length === 0 || editEle.length === 0)
        return
    await Sync(flag, EmptyFunc, async () => {
        const sites = SitesHandle()
        const posts = await PostsHandle(postEle, editEle)
        const pager = PagerHandle(pagerEle[0]?.innerHTML)
        const p = {sites, posts, pager}
        console.info(flag, p)
        PDOM(p)
    }, EmptyFunc)
}

function PDOM(p) {
    const theme = document.createElement("div")
    theme.classList.add("theme-blog")
    const body = document.querySelector("body")
    headerDOM(p.sites, theme)
    PostsDOM(p.posts, theme)
    PagerDOM(p.pager, `${p.sites.url}p/`, theme)
    body.appendChild(theme)
    codeHighlight()
}

async function CategoryHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemTitle"))
    const editEle = Array.from(document.querySelectorAll("body #main .entrylistItem .entrylistItemPostDesc a")).filter(e => e.innerText === "编辑")
    const pagerEle = Array.from(document.querySelectorAll("body #main .pager"))
    const flag = "category"
    if (Done(flag) || postEle.length === 0 || editEle.length === 0)
        return
    await Sync(flag, EmptyFunc, async () => {
        const sites = SitesHandle()
        const posts = await PostsHandle(postEle, editEle)
        const pager = PagerHandle(pagerEle[0]?.innerHTML)
        const category = {sites, posts, pager}
        console.info(flag, category)
        CategoryDOM(category)
    }, EmptyFunc)
}

function CategoryDOM(category) {
    const theme = document.createElement("div")
    const body = document.querySelector("body")
    theme.classList.add("theme-blog")
    headerDOM(category.sites, theme)
    PostsDOM(category.posts, theme)
    PagerDOM(category.pager, `//${window.location.host}${window.location.pathname}`, theme)
    body.appendChild(theme)
    codeHighlight()
}

async function TagHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main .PostList .vertical-middle"))
    const editEle = Array.from(document.querySelectorAll("body #main .PostList .postDesc2 a"))
    const pagerEle = Array.from(document.querySelectorAll("body #main .Pager"))
    const flag = "tag"
    if (Done(flag) || postEle.length === 0 || editEle.length === 0)
        return
    await Sync(flag, EmptyFunc, async () => {
        const sites = SitesHandle()
        const posts = await PostsHandle(postEle, editEle)
        const pager = PagerHandle(pagerEle[0]?.innerHTML)
        const tag = {sites, posts, pager}
        console.info(flag, tag)
        TagDOM(tag)
    }, EmptyFunc)
}

function TagDOM(tag) {
    const theme = document.createElement("div")
    theme.classList.add("theme-blog")
    const body = document.querySelector("body")
    headerDOM(tag.sites, theme)
    PostsDOM(tag.posts, theme)
    PagerDOM(tag.pager, `//${window.location.host}${window.location.pathname}default.html`, theme)
    body.appendChild(theme)
    codeHighlight()
}

async function PostHandle() {
    const postEle = Array.from(document.querySelectorAll("body #main #post_detail .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main #post_detail .postDesc a")).filter(e => e.innerText === "编辑")
    const flag = "post"
    if (Done(flag) || postEle.length === 0 || editEle.length === 0)
        return
    await Sync(flag, EmptyFunc, async () => {
        const sites = SitesHandle()
        const posts = await PostsHandle(postEle, editEle)
        const post = {sites, post: posts[0]}
        console.info(flag, post)
        PostDOM(post)
    }, EmptyFunc)
}

function categoriesMateDOM(categories, post) {
    categories.classList.add("post-categories")
    categories.innerHTML += `🔖 `
    post.categories.forEach(category => {
        categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
    })
}

function tagMateDOM(tags, post) {
    tags.classList.add("post-tags")
    tags.innerHTML += `🏷`
    post.tags.forEach(tag => {
        tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
    })
}

function PostDOM(post) {
    const theme = document.createElement("div")
    theme.classList.add("theme-blog")
    const body = document.querySelector("body")
    headerDOM(post.sites, theme)
    const categories = document.createElement("span")
    if (post.post.categories.length) categoriesMateDOM(categories, post.post)
    const tags = document.createElement("span")
    if (post.post.tags.length) tagMateDOM(tags, post.post)
    const article = document.createElement("div")
    article.classList.add("theme-posts")
    article.innerHTML = `<article><h3 class="article-title"><a href="${post.post.url}"><span>${post.post.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${post.post.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(post.post.date)}">${new Date(post.post.date).toLocaleDateString()}</time></a></span></div><div class="article-content"><div class="entry">${post.post.content}</div></div><div class="article-footer"><div class="article-meta pull-left">${categories.outerHTML}${tags.outerHTML}</div></div></article>`
    theme.appendChild(article)
    body.appendChild(theme)
    codeHighlight()
}


function headerDOM(sites, body) {
    const brand = document.createElement("div")
    brand.classList.add("theme-branding")
    brand.innerHTML = `<h1 class="site-title"><a href="${sites.url}">${sites.title}</a></h1><p class="site-description">${sites.subtitle}</p>`
    body.appendChild(brand)
    const navigation = document.createElement("nav")
    navigation.classList.add("theme-navigation")
    navigation.innerHTML = `<ul><li><a href="${sites.url}">主页</a></li><li><a href="${sites.url}p/">归档</a></li></ul>`
    body.appendChild(navigation)
}

function PagerDOM(pager, url, body) {
    const _pager = document.createElement("div")
    _pager.classList.add("theme-pager")
    if (pager.cur !== 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur - 1}"><</a><a href="${url}?page=1">1</a>`
    if (pager.cur - 1 > 2) _pager.innerHTML += `...`
    if (pager.cur - 1 > 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur - 1}">${pager.cur - 1}</a>`
    _pager.innerHTML += `<a class="active" href="${url}?page=${pager.cur}">${pager.cur}</a>`
    if (pager.page - pager.cur > 1) _pager.innerHTML += `<a href="${url}?page=${pager.cur + 1}">${pager.cur + 1}</a>`
    if (pager.page - pager.cur > 2) _pager.innerHTML += `...`
    if (pager.cur !== pager.page) _pager.innerHTML += `<a href="${url}?page=${pager.page}">${pager.page}</a><a href="${url}?page=${pager.cur + 1}">></a>`
    body.appendChild(_pager)
}

function PostsDOM(posts, body) {
    const articles = document.createElement("div")
    articles.classList.add("theme-posts")
    posts.forEach(e => {
        const categories = document.createElement("span")
        if (e.categories.length) categoriesMateDOM(categories, e)
        const tags = document.createElement("span")
        if (e.tags.length) tagMateDOM(tags, e)
        articles.innerHTML += `<article><h3 class="article-title"><a href="${e.url}"><span>${e.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${e.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(e.date)}">${new Date(e.date).toLocaleDateString()}</time></a></span></div><div class="article-content"><div class="entry">${e.desc}</div></div><div class="article-footer"><div class="article-meta pull-left">${categories.outerHTML}${tags.outerHTML}</div></div></article>`
    })
    body.appendChild(articles)
}

function codeHighlight() {
    if (!document.querySelector("pre code")) return
    Load(CodeHighlightStyleURL, "css")
    Load(CodeHighlightEngineURL, "js", async () => {
        if (Config.codeHighlightEngine === 1) hljs.initHighlighting()
        if (Config.codeHighlightEngine === 2) Prism.highlightAll()
    })
}