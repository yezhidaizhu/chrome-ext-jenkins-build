
export function sleep(ms = 100) {
    return new Promise(r => setTimeout(r, ms))
}