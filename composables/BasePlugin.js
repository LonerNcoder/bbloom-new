import axios from 'axios';
import * as cheerio from 'cheerio';
import {usePluginFetch} from './usePluginFetch.js';

const novelStructure = {
    id : 0,
    title: "Novel Title",
    summary: "Novel's summary",
    author: "author",
    genres: ["classic"],
    coverImage: "coverImageUrl",
    authorId: 0,
    chapters: 100,
    langId: 1,
    likes: 0,
    dislikes: 0,
    rating: 0,
    reads: 0,
    views: 0,
    savedInLibrary: 0,
    source: "bookbloom",
    status: "Completed",
    updatedAt: "date",
    uploadedAt: "date"
}

export default class BasePlugin{
    constructor(url = null){
        this.baseUrl = url? url: "http://localhost:3000";
    }
    getAvailabeRankingTypes(){
        return ["daily", "weekly", "monthly", "all-time"]
    }
    async getRankings(page=1, ranking_type="daily"){
    }
    async getNovels(options={}){
        console.log(options)
        const {
            page=1, limit=10, query, endpoint, cache=true, cacheTime=60000
        } = options;
        let _endpoint = this.baseUrl+endpoint;
        const data = await usePluginFetch(_endpoint,{
            enableCache: cache,
            cacheTime: cacheTime,
            headers: {
                "Accept" : "/",
                "Access-Control-Allow-Origin": '*',
            }
        })
        console.log(data)
    }
    async searchnovel(options={}){
        const {searchQuery="fantasy"} = options;
        let searchUrl = "https://www.mtlnovels.com/?__amp_source_origin=https%3A%2F%2Fwww.mtlnovels.com";
        const formData = new FormData();
        formData.append("s",searchQuery);
        const data = await usePluginFetch(searchUrl,{
            method: "POST",
            body: formData,
            enableCache: true,
            cacheTime: 60000
        })
        console.log(data)
    }
}