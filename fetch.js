function readyStateOver(req) {
    return new Promise(r => {
        req.onreadystatechange = _ => {
            if (req.readyState === 4 && req.status === 200)
                r(req.responseText)
        }
    })
}

export async function Fetch(url) {
    const req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.send()
    return await readyStateOver(req);
}
