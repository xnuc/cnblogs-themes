import {UpdateHandles} from "../event/dom"
import {PostsHandle} from "../event/posts"
import {IsLock, IsSign, Lock, Sign, Unlock} from "../util/register";
import {PagerHandle} from "../event/pager";

(async _ => {
    const paths = window.location.pathname.split("/").filter(e => e !== '')
    while (paths.shift() !== currentBlogApp && paths.length !== 0) {
    }
    paths.push("")
    switch (paths[0]) {
        // case "tag":
        //     if (paths.shift()) UpdateHandles.push(PAndTagHandle)
        //     document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
        //     break
        case "p":
            if (paths.shift()) UpdateHandles.push(PostHandle)
            // if (!paths.shift()) UpdateHandles.push(PAndTagHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
            break
        // case "category":
        //     UpdateHandles.push(CategoriesAndArchivesHandle)
        //     document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
        //     break
        // case "archive":
        //     UpdateHandles.push(CategoriesAndArchivesHandle)
        //     document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
        //     break
        default:
            UpdateHandles.push(IndexHandle)
            document.addEventListener("DOMNodeInserted", e => UpdateHandles.forEach(handle => handle(e)))
    }
})()

// index needs site info posts info and page info...
async function IndexHandle() {
    const flag = "index"
    const postEle = Array.from(document.querySelectorAll("body #main .postTitle .postTitle2"))
    const editEle = Array.from(document.querySelectorAll("body #main .postDesc a"))
    if (IsSign(flag) || IsLock(`_${flag}`) || postEle.length === 0 || editEle.length === 0)
        return
    Lock(`_${flag}`)
    const url = document.querySelectorAll("body #header #blogTitle h1 a")[0].href
    const title = document.querySelectorAll("body #header #blogTitle h1")[0].innerText.trim()
    const subtitle = document.querySelectorAll("body #header #blogTitle h2")[0].innerText.trim()
    const sites = {title, subtitle, url}
    const res = await Promise.all([PostsHandle(postEle, editEle), PagerHandle()])
    const index = {sites, posts: res[0], pager: res[1]}
    await IndexDOM(index)
    Sign(`${flag}`)
    Unlock(`_${flag}`)
    console.info("index", index)
}

async function IndexDOM(index) {
    const body = document.querySelector("body")
    const brand = document.createElement("div")
    brand.innerHTML = `<div class="site-branding"><h1 class="site-title"><a href="${index.sites.url}">${index.sites.title}</a></h1><p class="site-description">${index.sites.subtitle}</p></div>`
    body.appendChild(brand)
    const navigation = document.createElement("div")
    navigation.innerHTML = `<nav class="site-navigation"><ul class=""><li><a href="${index.sites.url}">主页</a></li><li><a href="/">首页</a></li><li><a href="/">首页</a></li><li><a href="/">首页</a></li></ul></nav>`
    body.appendChild(navigation)
    const articles = document.createElement("div")
    index.posts.forEach(e => {
        const tags = document.createElement("span")
        e.tags.forEach(tag => {
            tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
        })
        const categories = document.createElement("span")
        e.categories.forEach(category => {
            categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
        })
        const article = document.createElement("div")
        article.innerHTML = `<article class=" "><h3 class="article-title"><a href="${e.url}"><span>${e.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${e.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(e.date)}">${new Date(e.date).toLocaleString()}</time></a></span></div><div class="article-content"><div class="entry">${e.desc}</div></div><div class="article-footer"><div class="article-meta pull-left">${tags.outerHTML}${categories.outerHTML}</div></div></article>`
        articles.appendChild(article)
    })
    body.appendChild(articles)
    const pager = document.createElement("div")
    if (index.pager.cur !== 1) pager.innerHTML += `<a href="${index.sites.url}default.html?page=${index.pager.cur - 1}"><</a><a href="${index.sites.url}default.html?page=1">1</a>`
    if (index.pager.cur - 1 > 2) pager.innerHTML += `...`
    if (index.pager.cur - 1 > 1) pager.innerHTML += `<a href="${index.sites.url}default.html?page=${index.pager.cur - 1}">${index.pager.cur - 1}</a>`
    pager.innerHTML += `<a href="${index.sites.url}default.html?page=${index.pager.cur}">${index.pager.cur}</a>`
    if (index.pager.page - index.pager.cur > 1) pager.innerHTML += `<a href="${index.sites.url}default.html?page=${index.pager.cur + 1}">${index.pager.cur + 1}</a>`
    if (index.pager.page - index.pager.cur > 2) pager.innerHTML += `...`
    if (index.pager.cur !== index.pager.page) pager.innerHTML += `<a href="${index.sites.url}default.html?page=${index.pager.page}">${index.pager.page}</a><a>></a>`
    body.appendChild(pager)
    if (!document.querySelector("pre code")) return
    await markdown_highlight()
    document.querySelector('pre code').innerHTML = hljs.highlightAuto(document.querySelector('pre code').innerHTML).value
}
