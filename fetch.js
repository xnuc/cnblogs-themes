function readyStateOver(req) {
    return new Promise(r => {
        req.onreadystatechange = _ => {
            if (req.readyState === 4 && req.status === 200)
                r(req.responseText)
        }
    })
}

async function fetch(url) {
    const req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.send()
    return await readyStateOver(req);
}

(async _ => {
    const rsp1 = fetch("/"), rsp2 = fetch("/")
    console.log(await rsp1, await rsp2)
})()