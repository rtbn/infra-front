import axios from 'axios';
import { ui } from '../ui';

export interface EdumediaMedia {
    id: string
    title: string
    type: "simulation" | "video" | "doc_pack"
    computedType: "simulation" | "video" | "quiz" | "doc_pack"
    width: number
    height: number
    wide: boolean
    href: string
    apiURL: string
    thumbnail: string
    leaf: boolean
    media: boolean
}
export interface EdumediaMediaDetails extends EdumediaMedia {
    frameURL: string
}
export interface EdumediaSearchResult {
    href: "string"
    q: "string"
    medias: EdumediaMedia[]
}
export interface EdumediaTree {
    id: string
    title: string
    type: "root" | "node" | "curriculum"
    leaf: boolean
    href: string
    parentID: string
    //leaf has media else it has children
    children?: EdumediaTreeItem[]
    medias?: EdumediaMedia[]
}
export interface EdumediaTreeItem {
    id: string
    title: string
    href: string
    apiURL: string
    leaf: boolean
}
export const edumediaService = {
    cacheBaseUrl: null,
    getUrl(): Promise<string> {
        const inner = async () => {
            if (!edumediaService.cacheBaseUrl) {
                const conf = await ui.getCurrentThemeConf();
                edumediaService.cacheBaseUrl = conf.edumedia;
                if (!edumediaService.cacheBaseUrl) {
                    console.warn("Edumedia not configured in theme-conf.js or in current theme", conf);
                    edumediaService.cacheBaseUrl = "https://www.edumedia-sciences.com";
                }
            }
            return `${edumediaService.cacheBaseUrl}/${window.entcore.currentLanguage}/api/v1`
        }
        return inner();
    },
    async search(search: string, max?: number): Promise<EdumediaSearchResult> {
        const url = await edumediaService.getUrl();
        const res = await axios({
            url: `${url}/search?q=${search}&max=${max}`,
            method: 'get'
        });
        return res.data;
    },
    async fetchSubjects(): Promise<EdumediaTree> {
        const url = await edumediaService.getUrl();
        const res = await axios({
            url: `${url}/tree-item/n-root`,
            method: 'get'
        });
        return res.data;
    },
    async fetchChildren(item: EdumediaTreeItem): Promise<EdumediaTree> {
        const res = await axios({
            url: item.apiURL,
            method: 'get'
        }) as any;
        const data: EdumediaTree = res.data;
        if (data.medias) {
            data.medias.forEach(m => m.media = true)
        }
        return data;
    },
    async fetchMediaDetail(media: EdumediaMedia): Promise<EdumediaMediaDetails> {
        const res = await axios({
            url: media.apiURL,
            method: 'get'
        });
        return res.data;
    },
    toHtml(media: EdumediaMediaDetails) {
        return `
            <div style="position:relative">
                <iframe id="edumedia_${media.id}" title="${media.title}" width="${media.width}" height="${media.height}" src="${media.frameURL}">
                </iframe>  
                <h6 edumedia-fullscreen-jquery="edumedia_${media.id}">Afficher en plein écran</h6>
            </div>  
        `
    }
}