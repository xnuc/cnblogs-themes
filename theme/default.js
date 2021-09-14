import {UpdateHandles} from "../event/dom"
import {PostsHandle, CodeHighlightEngineURL, CodeHighlightStyleURL} from "../event/posts"
import {IsLock, IsSign, Lock, Sign, Unlock} from "../util/register";
import {IndexPagerHandle, PagerHandle} from "../event/pager";
import {Load} from "../util/load"

// route
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

// index
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
    Load(CodeHighlightStyleURL, "css")
    Load(CodeHighlightEngineURL, "js", async () => {
        if (codeHighlightEngine === 1) document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        else Prism.highlightAll()
    })
}

// p
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
    Load(CodeHighlightStyleURL, "css")
    Load(CodeHighlightEngineURL, "js", async () => {
        if (codeHighlightEngine === 1) document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        else Prism.highlightAll()
    })
}

// category
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
    theme.classList.add("blog-theme")
    headerDOM(category.sites, theme)
    PostsDOM(category.posts, theme)
    PagerDOM(category.pager, `//${window.location.host}${window.location.pathname}`, theme)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    Load(CodeHighlightStyleURL, "css")
    Load(CodeHighlightEngineURL, "js", async () => {
        if (codeHighlightEngine === 1) document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        else Prism.highlightAll()
    })
}

// tag
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
    Load(CodeHighlightStyleURL, "css")
    Load(CodeHighlightEngineURL, "js", async () => {
        if (codeHighlightEngine === 1) document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        else Prism.highlightAll()
    })
}

// post
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
    const categories = document.createElement("span")
    if (post.post.categories.length) {
        categories.classList.add("post-categories")
        categories.innerHTML += `<svg t="1631597859315" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5937" width="200" height="200"><path d="M817.464889 151.722667c-107.662222-107.633778-282.965333-107.633778-390.542222 0L128.682667 449.792a10.296889 10.296889 0 0 0-2.958223 7.310222c0 2.759111 1.024 5.376 2.958223 7.310222l42.183111 42.183112a10.296889 10.296889 0 0 0 14.506666 0L483.640889 208.497778a194.759111 194.759111 0 0 1 138.609778-57.372445c52.337778 0 101.603556 20.366222 138.524444 57.372445a194.702222 194.702222 0 0 1 57.372445 138.524444c0 52.337778-20.337778 101.489778-57.372445 138.524445L456.760889 789.447111l-49.237333 49.265778a118.158222 118.158222 0 0 1-166.968889 0 117.134222 117.134222 0 0 1-34.531556-83.427556c0-31.573333 12.231111-61.155556 34.531556-83.427555l301.596444-301.511111c7.651556-7.537778 17.720889-11.747556 28.444445-11.747556h0.113777c10.752 0 20.679111 4.209778 28.245334 11.776 7.651556 7.651556 11.776 17.692444 11.776 28.444445 0 10.638222-4.266667 20.679111-11.776 28.216888l-246.528 246.300445a10.268444 10.268444 0 0 0-2.958223 7.310222c0 2.759111 1.024 5.376 2.958223 7.310222l42.183111 42.183111a10.268444 10.268444 0 0 0 14.506666 0l246.414223-246.414222c22.755556-22.755556 35.185778-52.906667 35.185777-85.020444 0-32.113778-12.572444-62.407111-35.214222-85.048889a120.604444 120.604444 0 0 0-170.268444 0L455.964444 343.04l-272.213333 272.128a196.807111 196.807111 0 0 0-58.055111 140.231111c0 52.906667 20.679111 102.627556 58.026667 140.003556a197.973333 197.973333 0 0 0 140.231111 57.941333 197.546667 197.546667 0 0 0 140.145778-57.941333l353.365333-353.137778a274.773333 274.773333 0 0 0 80.782222-195.214222 273.891556 273.891556 0 0 0-80.782222-195.328z" p-id="5938"></path></svg>`
        post.post.categories.forEach(category => {
            categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
        })
    }
    const tags = document.createElement("span")
    if (post.post.tags.length) {
        tags.classList.add("post-tags")
        tags.innerHTML += `<svg t="1631598524446" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6071" width="200" height="200"><path d="M478.87362 829.861854l432.018325-432.160483c1.93335-1.93335 2.843161-4.549058 2.644139-7.164766l-29.142401-344.306806a18.309957 18.309957 0 0 0-16.689355-16.689355L523.425954 0.568632a8.899094 8.899094 0 0 0-7.193198 2.615708L84.185999 435.202665a9.18341 9.18341 0 0 0 0 12.907952l381.779669 381.751237c3.52552 3.667678 9.354 3.667678 12.907952 0z m71.505501-744.453295l256.566855 21.693319 21.693319 256.566855L472.334349 719.888384l-278.260174-278.146448L550.379121 85.408559z m68.719203 212.725311a54.873009 54.873009 0 0 0 89.417415-59.763246 54.873009 54.873009 0 1 0-89.417415 59.763246z m324.120362 245.563822l-45.234693-45.120966a9.18341 9.18341 0 0 0-12.907951 0L471.538264 911.318419 200.15854 640.56419a9.18341 9.18341 0 0 0-12.907952 0l-45.234692 45.120966a9.154979 9.154979 0 0 0 0 12.907951l277.805268 277.350363 45.234693 45.120966c3.553951 3.553951 9.382432 3.553951 12.907951 0l465.28331-464.487224a9.154979 9.154979 0 0 0 0-12.907952z" p-id="6072"></path></svg>`
        post.post.tags.forEach(tag => {
            tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
        })
    }
    const article = document.createElement("div")
    article.classList.add("posts")
    article.innerHTML = `<article><h3 class="article-title"><a href="${post.post.url}"><span>${post.post.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${post.post.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(post.post.date)}">${new Date(post.post.date).toLocaleDateString()}</time></a></span></div><div class="article-content"><div class="entry">${post.post.content}</div></div><div class="article-footer"><div class="article-meta pull-left">${categories.outerHTML}${tags.outerHTML}</div></div></article>`
    theme.appendChild(article)
    body.appendChild(theme)
    if (!document.querySelector("pre code")) return
    Load(CodeHighlightEngineURL, "js", async () => {
        if (codeHighlightEngine === 1) document.querySelectorAll('pre code').forEach(e => e.innerHTML = hljs.highlightAuto(e.innerHTML).value)
        else Prism.highlightAll()
    })
}

function Sites() {
    const url = document.querySelectorAll("body #header #blogTitle h1 a")[0].href
    const title = document.querySelectorAll("body #header #blogTitle h1")[0].innerText.trim()
    const subtitle = document.querySelectorAll("body #header #blogTitle h2")[0].innerText.trim()
    return {title, subtitle, url};
}

function headerDOM(sites, body) {
    const brand = document.createElement("div")
    brand.classList.add("site-branding")
    brand.innerHTML = `<h1 class="site-title"><a href="${sites.url}">${sites.title}</a></h1><p class="site-description">${sites.subtitle}</p>`
    body.appendChild(brand)
    const navigation = document.createElement("nav")
    navigation.classList.add("site-navigation")
    navigation.innerHTML = `<ul><li><a href="${sites.url}">主页</a></li><li><a href="${sites.url}p/">归档</a></li></ul>`
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
    articles.classList.add("posts")
    posts.forEach(e => {
        const categories = document.createElement("span")
        if (e.categories.length) {
            categories.classList.add("post-categories")
            categories.innerHTML += `<svg t="1631597859315" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5937" width="200" height="200"><path d="M817.464889 151.722667c-107.662222-107.633778-282.965333-107.633778-390.542222 0L128.682667 449.792a10.296889 10.296889 0 0 0-2.958223 7.310222c0 2.759111 1.024 5.376 2.958223 7.310222l42.183111 42.183112a10.296889 10.296889 0 0 0 14.506666 0L483.640889 208.497778a194.759111 194.759111 0 0 1 138.609778-57.372445c52.337778 0 101.603556 20.366222 138.524444 57.372445a194.702222 194.702222 0 0 1 57.372445 138.524444c0 52.337778-20.337778 101.489778-57.372445 138.524445L456.760889 789.447111l-49.237333 49.265778a118.158222 118.158222 0 0 1-166.968889 0 117.134222 117.134222 0 0 1-34.531556-83.427556c0-31.573333 12.231111-61.155556 34.531556-83.427555l301.596444-301.511111c7.651556-7.537778 17.720889-11.747556 28.444445-11.747556h0.113777c10.752 0 20.679111 4.209778 28.245334 11.776 7.651556 7.651556 11.776 17.692444 11.776 28.444445 0 10.638222-4.266667 20.679111-11.776 28.216888l-246.528 246.300445a10.268444 10.268444 0 0 0-2.958223 7.310222c0 2.759111 1.024 5.376 2.958223 7.310222l42.183111 42.183111a10.268444 10.268444 0 0 0 14.506666 0l246.414223-246.414222c22.755556-22.755556 35.185778-52.906667 35.185777-85.020444 0-32.113778-12.572444-62.407111-35.214222-85.048889a120.604444 120.604444 0 0 0-170.268444 0L455.964444 343.04l-272.213333 272.128a196.807111 196.807111 0 0 0-58.055111 140.231111c0 52.906667 20.679111 102.627556 58.026667 140.003556a197.973333 197.973333 0 0 0 140.231111 57.941333 197.546667 197.546667 0 0 0 140.145778-57.941333l353.365333-353.137778a274.773333 274.773333 0 0 0 80.782222-195.214222 273.891556 273.891556 0 0 0-80.782222-195.328z" p-id="5938"></path></svg>`
            e.categories.forEach(category => {
                categories.innerHTML += `<a href="${category.url}">${category.name}</a>`
            })
        }
        const tags = document.createElement("span")
        if (e.tags.length) {
            tags.classList.add("post-tags")
            tags.innerHTML += `<svg t="1631598524446" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6071" width="200" height="200"><path d="M478.87362 829.861854l432.018325-432.160483c1.93335-1.93335 2.843161-4.549058 2.644139-7.164766l-29.142401-344.306806a18.309957 18.309957 0 0 0-16.689355-16.689355L523.425954 0.568632a8.899094 8.899094 0 0 0-7.193198 2.615708L84.185999 435.202665a9.18341 9.18341 0 0 0 0 12.907952l381.779669 381.751237c3.52552 3.667678 9.354 3.667678 12.907952 0z m71.505501-744.453295l256.566855 21.693319 21.693319 256.566855L472.334349 719.888384l-278.260174-278.146448L550.379121 85.408559z m68.719203 212.725311a54.873009 54.873009 0 0 0 89.417415-59.763246 54.873009 54.873009 0 1 0-89.417415 59.763246z m324.120362 245.563822l-45.234693-45.120966a9.18341 9.18341 0 0 0-12.907951 0L471.538264 911.318419 200.15854 640.56419a9.18341 9.18341 0 0 0-12.907952 0l-45.234692 45.120966a9.154979 9.154979 0 0 0 0 12.907951l277.805268 277.350363 45.234693 45.120966c3.553951 3.553951 9.382432 3.553951 12.907951 0l465.28331-464.487224a9.154979 9.154979 0 0 0 0-12.907952z" p-id="6072"></path></svg>`
            e.tags.forEach(tag => {
                tags.innerHTML += `<a href="${tag.url}">${tag.name}</a>`
            })
        }
        articles.innerHTML += `<article><h3 class="article-title"><a href="${e.url}"><span>${e.title}</span></a></h3><div class="article-top-meta"><span class="posted-on"><a href="${e.url}" rel="bookmark"><time class="entry-date published" datetime="${new Date(e.date)}">${new Date(e.date).toLocaleDateString()}</time></a></span></div><div class="article-content"><div class="entry">${e.desc}</div></div><div class="article-footer"><div class="article-meta pull-left">${categories.outerHTML}${tags.outerHTML}</div></div></article>`
    })
    body.appendChild(articles)
}
