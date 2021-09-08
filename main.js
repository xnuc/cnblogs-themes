import {updateHandles} from "./dom"
import {PostHandle, PostsHandle} from "./posts"

(async _ => {
    updateHandles.push(PostsHandle)
    updateHandles.push(PostHandle)
    document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
})()
