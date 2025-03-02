document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    function saveUsers() {
        localStorage.setItem("users", JSON.stringify(users));
    }

  
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("new-username").value;
            const password = document.getElementById("new-password").value;

            if (users.some(user => user.username === username)) {
                Swal.fire("Error", "El usuario ya existe.", "error");
                return;
            }

            const newUser = { username, password, balance: 0, loans: [] };
            users.push(newUser);
            saveUsers();

            Swal.fire("Éxito", "Usuario registrado correctamente.", "success").then(() => {
                registerForm.reset();
            });
        });
    }

    
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                window.location.href = "banco.html";  
            } else {
                errorMessage.style.display = "block";
            }
        });
    }
});
