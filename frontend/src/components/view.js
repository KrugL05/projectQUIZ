import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class View {
    constructor() {
        this.routerParams = UrlManager.getQueryParams();
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }

        const fullNameElement = document.getElementById('user-full-name');
        const emailElement = document.getElementById('user-email');
        if (fullNameElement && userInfo.fullName) {
            fullNameElement.innerText = userInfo.fullName;
        }
        if (emailElement && userInfo.email) {
            emailElement.innerText = userInfo.email;
        }

        const id = this.routerParams.id;
        if (!id) {
            location.href = '#/';
            return;
        }

        try {
            const result = await CustomHttp.request(
                config.host + '/tests/' + id + '/result/details?userId=' + userInfo.userId
            );

            if (!result || result.error) {
                throw new Error(result ? result.message : 'Ошибка загрузки');
            }

            const test = result.test;
            document.getElementById('quiz-name').innerText = test.name;
            this.render(test);
        } catch (e) {
            console.log(e);
            location.href = '#/';
        }
    }

    render(test) {
        const container = document.getElementById('questions');

        test.questions.forEach((question, index) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'test-question';

            const titleEl = document.createElement('div');
            titleEl.className = 'test-question-title';
            titleEl.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;
            questionEl.appendChild(titleEl);

            question.answers.forEach(answer => {
                const optionEl = document.createElement('div');
                optionEl.className = 'test-question-option';

                const radioEl = document.createElement('input');
                radioEl.setAttribute('type', 'radio');
                radioEl.setAttribute('name', 'question-' + question.id);
                radioEl.disabled = true;

                const labelEl = document.createElement('label');
                labelEl.innerText = answer.answer;

                if (answer.hasOwnProperty('correct')) {
                    radioEl.checked = true;
                    const isCorrect = answer.correct === true;
                    radioEl.classList.add(isCorrect ? 'correct' : 'incorrect');
                    optionEl.classList.add(isCorrect ? 'correct' : 'incorrect');
                    labelEl.classList.add(isCorrect ? 'correct' : 'incorrect');
                }

                optionEl.appendChild(radioEl);
                optionEl.appendChild(labelEl);
                questionEl.appendChild(optionEl);
            });

            container.appendChild(questionEl);
        });
    }
}


