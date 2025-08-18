document.getElementById("logoutButton").addEventListener("click", async function () {
    await logout();
});

const logout = async () => {
    const url = `http://localhost:8000/api/logout`;
    const api_token = localStorage.getItem("api_token");

    if (!api_token) {
        console.error("No token found in localStorage. User may already be logged out.");
        window.location.href = "../index.html";
        return;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${api_token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem("api_token");
            console.log("Logged out successfully!");

            window.location.href = "../../html/index.html";
        } else {
            console.log("Logout failed: ", data.message);
        }
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
