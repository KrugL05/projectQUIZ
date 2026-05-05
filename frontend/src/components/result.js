import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp as customHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Result {
    constructor() {
        this.routerParams = UrlManager.getQueryParams()
        const viewLink = document.getElementById('result-view');
        viewLink.href = '#/view?id=' + this.routerParams.id + '&answers=' + this.routerParams.answers;

        this.init();
    }

    async init(){
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        if(this.routerParams.id) {
            try {
                const result = await customHttp.request(config.host + '/tests/' + this.routerParams.id + '/result?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    document.getElementById('result-score').innerText = result.score + '/' + result.total;
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }

        location.href = '#/';
    }
}

