async function fetch(url) {
    const req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.send(null)
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            return (req.responseText)
        }
    }
}

(async _ => {
    const rsp1 = fetch("/"), rsp2 = fetch("/")
    const all = Promise.all([rsp1, rsp2])
    console.log(await all)
})()