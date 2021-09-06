import {Fetch} from "./fetch";

export async function Posts(selector) {
    const _posts = []
    document.querySelectorAll(selector).forEach(e => {
        _posts.push(Fetch(e.href))
    })
    const allRsp = await Promise.all(_posts)
    _posts.splice(0, _posts.length)
    allRsp.forEach(e => {
        _posts.push(e)
    })
    return _posts
}
