const { createApp } = Vue;

// КОМПОНЕНТ РЕЄСТРАЦІЇ (register.html)
if (document.getElementById('register-app')) {
    createApp({
        data() {
            return {
                form: {
                    name: '',
                    email: '',
                    gender: '',
                    date: '',
                    password: '',
                    passwordConfirm: ''
                }
            }
        },
        methods: {
            async registerUser() {
                if (this.form.password !== this.form.passwordConfirm) {
                    alert('Помилка: Паролі не співпадають!');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.form)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error);
                    }

                    alert(data.message);
                    window.location.href = 'login.html';

                } catch (error) {
                    alert(error.message);
                }
            }
        }
    }).mount('#register-app');
}

// КОМПОНЕНТ ВХОДУ (login.html)
if (document.getElementById('login-app')) {
    createApp({
        data() {
            return {
                form: { email: '', password: '' }
            }
        },
        methods: {
            async loginUser() {
                try {
                    const response = await fetch('http://localhost:3000/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(this.form)
                    });
                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error);

                    alert(data.message);
                    localStorage.setItem('logged_user', JSON.stringify(data.user));
                    window.location.href = 'profile.html';

                } catch (error) {
                    alert(error.message);
                }
            }
        }
    }).mount('#login-app');
}

// КОМПОНЕНТ ПРОФІЛЮ (profile.html)
if (document.getElementById('profile-app')) {
    createApp({
        data() {
            return {
                user: null,
                isEditing: false,
                editForm: {}
            }
        },
        mounted() {
            const savedUser = localStorage.getItem('logged_user');
            if (savedUser) {
                this.user = JSON.parse(savedUser);
            } else {
                alert('Доступ заборонено! Будь ласка, увійдіть у систему.');
                window.location.href = 'login.html';
            }
        },
        methods: {
            logout() {
                localStorage.removeItem('logged_user');
                window.location.href = 'login.html';
            },
            formatGender(gender) {
                if (gender === 'male') return 'Чоловіча';
                if (gender === 'female') return 'Жіноча';
                return 'Інша';
            },
            toggleEdit() {
                this.isEditing = !this.isEditing;
                if (this.isEditing) {
                    this.editForm = { ...this.user };
                }
            },
            async updateProfile() {
                try {
                    const response = await fetch('http://localhost:3000/api/update', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(this.editForm)
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);

                    alert(data.message);

                    this.user = { ...this.user, ...this.editForm };
                    localStorage.setItem('logged_user', JSON.stringify(this.user));
                    this.isEditing = false;

                } catch (error) {
                    alert(error.message);
                }
            },
            async deleteAccount() {
                const confirmed = confirm('Ви впевнені, що хочете видалити свій акаунт? Цю дію неможливо скасувати!');

                if (confirmed) {
                    try {
                        const response = await fetch('http://localhost:3000/api/delete', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: this.user.email })
                        });

                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error);

                        alert(data.message);
                        localStorage.removeItem('logged_user');
                        window.location.href = 'register.html';

                    } catch (error) {
                        alert(error.message);
                    }
                }
            }
        }
    }).mount('#profile-app');
}