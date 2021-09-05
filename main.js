import {Fetch} from "./fetch.js"

(async _ => {
    const rsp = Fetch("//sm.ms/image/zJGEwF9M7StnAYs")
    console.log(await rsp)
})()