document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await login(email, password);
});

const login = async (email, password) => {
    const url = `http://localhost:8000/api/login`;

    const email_exist = await fetch (`${url}/exist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
    });
    const email_ex = await email_exist.json()
    if(!email_ex.exists)
    {
        alert(`Invalid email or password.`);
        return;
    }

    try {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, userTimeZone }),
        });

        const data = await response.json();

        if (response.ok && data.message === 'Login successful') {
            localStorage.setItem("api_token", data.token);
            window.location.href = "../index.html";
        } else if(data.message === "Invalid email or password") {
            alert(`${data.message}.`)
        } else {
            window.location.href = `${data.html}?date=${data.ban_end_time}`;
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
};
