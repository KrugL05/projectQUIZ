(function () {
    const Result = {
        init() {
            const url = new URL(location.href);
            document.getElementById('result-score').innerText = url.searchParams.get('score') + '/' + url.searchParams.get('total');
            const viewLink = document.getElementById('result-view');
            viewLink.href = 'view.html?id=' + url.searchParams.get('id') + '&answers=' + url.searchParams.get('answers');
        }
    }

    Result.init();
})();