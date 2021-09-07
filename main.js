import {Posts} from "./posts";

(async _ => {
    console.log(await Posts("body #main .postTitle .postTitle2", "body #main .postDesc a", 1000))
})()
