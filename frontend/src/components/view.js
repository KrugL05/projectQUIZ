import {UrlManager} from "../utils/url-manager.js";

export class View {
    constructor() {
        this.routerParams = UrlManager.getQueryParams()
        const id = this.routerParams.id;
        const userAnswers = this.routerParams.answers.split(',').map(Number);

        const quizXhr = new XMLHttpRequest();
        quizXhr.open('GET', 'https://testologia.ru/get-quiz?id=' + id, false);
        quizXhr.send();

        const rightXhr = new XMLHttpRequest();
        rightXhr.open('GET', 'https://testologia.ru/get-quiz-right?id=' + id, false);
        rightXhr.send();

        if (quizXhr.status !== 200 || rightXhr.status !== 200) {
            location.href = '#/';
            return;
        }

        const quiz = JSON.parse(quizXhr.responseText);
        const rightAnswers = JSON.parse(rightXhr.responseText);

        document.getElementById('quiz-name').innerText = quiz.name;

        this.render(quiz, rightAnswers, userAnswers);
    }

    render(quiz, rightAnswers, userAnswers) {
        const container = document.getElementById('questions');

        quiz.questions.forEach((question, index) => {
            const userAnswerId = userAnswers[index];
            const rightAnswerId = rightAnswers[index];

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

                if (answer.id === userAnswerId) {
                    radioEl.checked = true;
                    const isCorrect = answer.id === rightAnswerId;
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

