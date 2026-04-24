import {UrlManager} from "../utils/url-manager.js";

export class Result {
    constructor() {
        this.routerParams = UrlManager.getQueryParams()
        document.getElementById('result-score').innerText = this.routerParams.score + '/' + this.routerParams.total;
        const viewLink = document.getElementById('result-view');
        viewLink.href = '#/view?id=' + this.routerParams.id + '&answers=' + this.routerParams.answers;
    }
}

