class TTG {
    getInfoById(itemId: string) {
        if(itemId.startsWith('/')) {
            itemId = itemId.slice(1)
        }
        return this.getInfo("https://ttg.club/" + itemId)
    }
    async getInfo(link: string) {
        const urlParams = new URL(link);
        const apiURL = `${urlParams.origin}/api/v1/${urlParams.pathname}`
        const res = await fetch(apiURL, {method: "POST"}).then(r => r.json())
        return {...res, id: urlParams.pathname}
    }
}


export const ttg = new TTG();
