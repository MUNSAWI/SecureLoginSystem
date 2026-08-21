const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Get CSRF token
        const csrfResponse = await fetch("/csrf-token");
        const csrfData = await csrfResponse.json();

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfData.token
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (response.redirected) {
            window.location.href = response.url;
            return;
        }

        const result = await response.json();

        message.textContent = result.message;

    } catch (error) {
        console.error(error);
        message.textContent = "Something went wrong. Please try again.";
    }
});