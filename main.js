import {updateHandles} from "./dom"
import {PostsHandle} from "./posts"
import {PostHandle} from "./post";

(async _ => {
    updateHandles.push(PostHandle)
    updateHandles.push(PostsHandle)
    document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
})()
