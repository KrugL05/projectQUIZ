import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(page) {
        this.agreeElement = null;
        this.processElement = null;
        this.page = page;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        this.fields = [
            {
                name: "email",
                id: "email",
                element: null,
                regex: /^\w+([\.-]?\w)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
                errorMessage: 'Введите корректный email',
            },
            {
                name: "password",
                id: "password",
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
                errorMessage: null,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: "name",
                    id: "name",
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                    errorMessage: 'Имя должно начинаться с заглавной буквы и содержать только кириллицу',
                },
                {
                    name: "lastName",
                    id: "last-name",
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                    errorMessage: 'Фамилия должна начинаться с заглавной буквы и содержать только кириллицу',
                },
            );
        }

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });

        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        }
    }

    getPasswordError(value) {
        if (!value) return 'Введите пароль';
        if (value.length < 8) return 'Пароль должен содержать не менее 8 символов';
        if (!/[A-Z]/.test(value)) return 'Пароль должен содержать хотя бы одну заглавную букву';
        if (!/[a-z]/.test(value)) return 'Пароль должен содержать хотя бы одну строчную букву';
        if (!/\d/.test(value)) return 'Пароль должен содержать хотя бы одну цифру';
        if (!/^[0-9a-zA-Z]+$/.test(value)) return 'Пароль может содержать только латинские буквы и цифры';
        return null;
    }

    showFieldError(field, message) {
        field.element.parentNode.style.borderColor = 'red';
        let errorEl = field.element.parentNode.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            field.element.parentNode.appendChild(errorEl);
        }
        errorEl.innerText = message;
    }

    clearFieldError(field) {
        field.element.parentNode.removeAttribute('style');
        const errorEl = field.element.parentNode.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    }

    showServerError(message) {
        let errorEl = document.getElementById('server-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'server-error';
            errorEl.className = 'server-error';
            this.processElement.parentNode.insertAdjacentElement('afterend', errorEl);
        }
        errorEl.innerText = message;
    }

    clearServerError() {
        const errorEl = document.getElementById('server-error');
        if (errorEl) errorEl.remove();
    }

    validateField(field, element) {
        if (field.name === 'password') {
            const passwordError = this.getPasswordError(element.value);
            if (passwordError) {
                this.showFieldError(field, passwordError);
                field.valid = false;
            } else {
                this.clearFieldError(field);
                field.valid = true;
            }
        } else {
            if (!element.value || !element.value.match(field.regex)) {
                this.showFieldError(field, field.errorMessage);
                field.valid = false;
            } else {
                this.clearFieldError(field);
                field.valid = true;
            }
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if (isValid) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            this.clearServerError();
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password
                    });
                    if (result) {
                        if (result.error || !result.user) {
                            const message = result.message || 'Ошибка регистрации';
                            this.showServerError(message);
                            return;
                        }
                    }
                } catch (error) {
                    this.showServerError('Пользователь с таким email уже существует.');
                    return;
                }
            }

            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password
                });
                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken
                        || !result.fullName || !result.userId) {
                        const message = result.message || 'Неверный email или пароль';
                        this.showServerError(message);
                        return;
                    }

                    Auth.setTokens(result.accessToken, result.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId,
                        email: email,
                    });
                    location.href = '#/choice';
                }
            } catch (error) {
                this.showServerError('Ошибка входа. Попробуйте позже.');
            }
        }
    }
}
