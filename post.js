import {HasElement, IsLock, IsSign, Lock, Sign, Unlock} from "./register";

const post = {}
const lock = "_post"
const sign = "post"

export function Post(titleSelector, bodySelector, categorySelector, tagSelector) {
    post.url = document.querySelector(titleSelector).href
    post.title = document.querySelector(titleSelector).innerText.trim()

    post.content = document.querySelector(bodySelector).innerHTML.trim()
    const category = document.querySelector(categorySelector).innerHTML
    const categories = []
    Array.from(category.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)).forEach(e => {
        categories.push({url: e[1], name: e[2]})
    })
    post.categories = categories

    const tag = document.querySelector(tagSelector).innerHTML
    const tags = []
    Array.from(tag.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)).forEach(e => {
        tags.push({url: e[1], name: e[2]})
    })
    post.tags = tags

    console.log(document.querySelector("body #main #post_detail #cnblogs_post_description").innerHTML)
    console.log(document.querySelector("body #main #post_detail .postDesc").innerHTML)

}

export function PostHandle() {
    if (IsSign(sign) || IsLock(lock) || !HasElement("body #main #post_detail #cnblogs_post_body")
        || !HasElement("body #main #post_detail #BlogPostCategory") || !HasElement("body #main #post_detail #EntryTag")
        || !HasElement("body #main #post_detail #cnblogs_post_description") || !HasElement("body #main #post_detail .postDesc")
        || !HasElement("body #main #post_detail #cb_post_title_url"))
        return
    Lock(lock)
    Post("body #main #post_detail #cb_post_title_url",
        "body #main #post_detail #cnblogs_post_body",
        "body #main #post_detail #BlogPostCategory",
        "body #main #post_detail #EntryTag")
    Sign(sign)
    Unlock(lock)
    console.debug(sign, post)
}