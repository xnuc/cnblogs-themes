import {Posts} from "./posts";

(async _ => {
    console.log(await Posts("body #main .postTitle .postTitle2", 1000))
})()
