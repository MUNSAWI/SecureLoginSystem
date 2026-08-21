const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";

    const formData = {
        username: document.getElementById("username").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.message;
            return;
        }

           message.textContent = result.message;

setTimeout(() => {
    console.log("Redirecting to login...");
    window.location.href = "/login.html";
}, 2000);

    } catch (error) {
        console.error("Signup error:", error);

        message.textContent = "Something went wrong. Please try again.";
    }
});