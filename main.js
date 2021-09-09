import {updateHandles} from "./dom";
import {CategoriesAndArchivesHandle, IndexHandle, PAndTagHandle, PostHandle} from "./posts";

(async _ => {
    const paths = window.location.pathname.split("/").filter(e => e !== '')
    while (paths.shift() !== currentBlogApp && paths.length !== 0) {
    }
    paths.push("")
    switch (paths[0]) {
        case "tag":
            if (paths.shift()) updateHandles.push(PAndTagHandle)
            document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
            break
        case "p":
            if (paths.shift()) updateHandles.push(PostHandle)
            if (!paths.shift()) updateHandles.push(PAndTagHandle)
            document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
            break
        case "category":
            updateHandles.push(CategoriesAndArchivesHandle)
            document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
            break
        case "archive":
            updateHandles.push(CategoriesAndArchivesHandle)
            document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
            break
        default:
            updateHandles.push(IndexHandle)
            document.addEventListener("DOMNodeInserted", e => updateHandles.forEach(handle => handle(e)))
    }
})()
