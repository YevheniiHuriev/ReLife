var phoneMask = IMask(
    document.getElementById('phone'), {
        mask: '(000) 000-0000',
        lazy: false
    });

const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() - 4);
const currentDateStr = currentDate.toISOString().split('T')[0];
const minDate = `${new Date().getFullYear() - 100}-01-01`;
document.getElementById('dateOfBirth').setAttribute('min', minDate);
document.getElementById('dateOfBirth').setAttribute('max', currentDateStr);

document.getElementById("photo").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.querySelector(".profile-picture-container").addEventListener("click", function() {
    document.getElementById("photo").click();
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirmation = document.getElementById("passwordConfirmation").value;
    const photoFile = document.getElementById("photo").files[0];
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    if (password !== passwordConfirmation) {
        alert("Passwords do not match");
        return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_confirmation", passwordConfirmation);
    if (photoFile) {
        formData.append("photo", photoFile);
    }
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("birthdate", dateOfBirth);
    formData.append("phone", phone);
    formData.append("address", address);

    try {
        const response = await fetch(`http://localhost:8000/api/register`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            body: formData,
        });

        if (response.ok) {
            console.log("Registration successful!");
            window.location.href = "./login.html";
        } else {
            const error = await response.json();
            console.error("Error response:", error);
        }
    } catch (error) {
        console.error("Registration failed:", error);
    }
});
