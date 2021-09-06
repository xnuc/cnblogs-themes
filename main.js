import {Posts} from "./post";

(async _ => {
    console.log(await Posts("body #main .postTitle a", 10))
})()
