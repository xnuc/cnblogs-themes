import {Fetch} from "./fetch";
import {Timeout, TimeoutStatus} from "./timeout";

export async function Posts(selector, timeout) {
    const _posts = []
    document.querySelectorAll(selector).forEach(e => {
        const f = Fetch(e.href)
        const t = Timeout(timeout)
        _posts.push(Promise.race([f, t]))
    })
    const allRsp = await Promise.all(_posts)
    _posts.splice(0, _posts.length)
    allRsp.forEach(e => {
        if (e === TimeoutStatus) {
            console.log("超时")
        }
        _posts.push(e)
    })
    return _posts
}
