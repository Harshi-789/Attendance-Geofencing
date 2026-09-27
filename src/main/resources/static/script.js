// =========================================================
// ATTENDTRACK - LOGIN JAVASCRIPT
// =========================================================


// =========================================================
// ELEMENTS
// =========================================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const loginButton = document.getElementById("loginButton");

const loginButtonText = document.getElementById("loginButtonText");

const loginMessage = document.getElementById("loginMessage");

const rememberMe = document.getElementById("rememberMe");


// =========================================================
// API
// =========================================================

const LOGIN_API = "/auth/login";


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "Show";
    }

});


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(message, type) {

    loginMessage.textContent = message;

    loginMessage.className = "login-message";

    if (type) {

        loginMessage.classList.add(type);
    }

}


// =========================================================
// BUTTON LOADING
// =========================================================

function setLoading(isLoading) {

    loginButton.disabled = isLoading;

    if (isLoading) {

        loginButtonText.textContent = "Signing in...";

    } else {

        loginButtonText.textContent = "Sign In";
    }

}


// =========================================================
// SAVE LOGIN DATA
// IMPORTANT:
// dashboard.js expects jwtToken and userEmail
// =========================================================

function saveLoginData(token, email) {

    if (rememberMe.checked) {

        localStorage.setItem(
            "jwtToken",
            token
        );

        localStorage.setItem(
            "userEmail",
            email
        );

    } else {

        sessionStorage.setItem(
            "jwtToken",
            token
        );

        sessionStorage.setItem(
            "userEmail",
            email
        );
    }

}


// =========================================================
// GET SAVED EMAIL
// =========================================================

function getSavedEmail() {

    return (

        localStorage.getItem("userEmail") ||

        sessionStorage.getItem("userEmail") ||

        ""
    );

}


// =========================================================
// CLEAR OLD LOGIN DATA
// =========================================================

function clearLoginData() {

    localStorage.removeItem("jwtToken");

    localStorage.removeItem("userEmail");

    sessionStorage.removeItem("jwtToken");

    sessionStorage.removeItem("userEmail");

}


// =========================================================
// LOGIN FORM
// =========================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            emailInput.value.trim();


        const password =
            passwordInput.value.trim();


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!email || !password) {

            showMessage(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        // -------------------------------------------------
        // START LOADING
        // -------------------------------------------------

        setLoading(true);

        showMessage("", "");


        try {

            // -------------------------------------------------
            // SEND LOGIN REQUEST
            // -------------------------------------------------

            const response =
                await fetch(
                    LOGIN_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email,

                            password: password

                        })
                    }
                );


            // -------------------------------------------------
            // READ BACKEND RESPONSE
            // -------------------------------------------------

            const contentType =
                response.headers.get(
                    "content-type"
                );


            let data;


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                data =
                    await response.text();
            }


            console.log(
                "Login API response:",
                data
            );


            // -------------------------------------------------
            // HANDLE LOGIN FAILURE
            // -------------------------------------------------

            if (!response.ok) {

                let errorMessage;


                if (
                    typeof data === "string"
                ) {

                    errorMessage =
                        data ||
                        "Invalid email or password.";

                } else {

                    errorMessage =
                        data.message ||
                        data.error ||
                        "Invalid email or password.";
                }


                showMessage(
                    errorMessage,
                    "error"
                );


                setLoading(false);

                return;
            }


            // -------------------------------------------------
            // GET JWT TOKEN
            //
            // Supports:
            //
            // 1. Plain text JWT
            // 2. { "token": "..." }
            // 3. { "accessToken": "..." }
            // 4. { "jwt": "..." }
            // -------------------------------------------------

            let token = null;


            if (
                typeof data === "string"
            ) {

                token =
                    data.trim();

            } else if (
                data &&
                typeof data === "object"
            ) {

                token =
                    data.token ||
                    data.accessToken ||
                    data.jwt;
            }


            // -------------------------------------------------
            // TOKEN NOT FOUND
            // -------------------------------------------------

            if (!token) {

                showMessage(
                    "Login successful, but JWT token was not received.",
                    "error"
                );


                console.error(
                    "Login response without token:",
                    data
                );


                setLoading(false);

                return;
            }


            // -------------------------------------------------
            // REMOVE OLD TOKEN
            // -------------------------------------------------

            clearLoginData();


            // -------------------------------------------------
            // SAVE NEW JWT
            //
            // IMPORTANT:
            // dashboard.js reads jwtToken
            // -------------------------------------------------

            saveLoginData(
                token,
                email
            );


            console.log(
                "JWT token saved successfully."
            );


            console.log(
                "Token:",
                token
            );


            // -------------------------------------------------
            // SUCCESS MESSAGE
            // -------------------------------------------------

            showMessage(
                "Login successful. Opening dashboard...",
                "success"
            );


            // -------------------------------------------------
            // REDIRECT
            // -------------------------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                700
            );


        } catch (error) {

            // -------------------------------------------------
            // CONNECTION ERROR
            // -------------------------------------------------

            console.error(
                "Login error:",
                error
            );


            showMessage(
                "Unable to connect to the server.",
                "error"
            );


            setLoading(false);
        }

    }
);


// =========================================================
// LOAD SAVED EMAIL
// =========================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedEmail =
            getSavedEmail();


        if (savedEmail) {

            emailInput.value =
                savedEmail;

            rememberMe.checked =
                true;
        }

    }
);


// =========================================================
// CLEAR MESSAGE WHEN EMAIL CHANGES
// =========================================================

emailInput.addEventListener(
    "input",
    function () {

        if (loginMessage) {

            loginMessage.textContent = "";
        }

    }
);


// =========================================================
// CLEAR MESSAGE WHEN PASSWORD CHANGES
// =========================================================

passwordInput.addEventListener(
    "input",
    function () {

        if (loginMessage) {

            loginMessage.textContent = "";
        }

    }
);