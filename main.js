import {Posts} from "./post";

(async _ => {
    console.log(await Posts("body #main_container #main .post h2 a"))
})()
