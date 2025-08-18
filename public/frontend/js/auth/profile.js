const loader = document.querySelector(".load");
const bodyPage = document.querySelector(".body-page");
loader.style.display="block";
function loaderOff() {
    loader.style.display="none";
    bodyPage.style.display="block";
}

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

document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("username");
    let current_user = null;

    async function getAuthenticatedUser() {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            return result.success ? result.data : null;

        } catch (error) {
            console.error("Error when receiving a user profile:", error);
            return null;
        }
    }

    async function urlToFile(url, fileName = null){
        const response = await fetch(`/${url}`);
        const data = await response.blob();
        const name = fileName || url.split('/').pop();
        const mimeType = data.type || 'image/jpg';

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
            throw new Error('Invalid file type. Only jpeg, jpg, or png are allowed.');
        }

        return new File([data], name, { type: mimeType });
    }

    async function populateForm(user) {
        document.getElementById("username").value = user.username || "";
        setWidth(usernameInput);
        document.getElementById("email").value = user.email || "";
        document.getElementById("firstName").value = user.first_name || "";
        document.getElementById("lastName").value = user.last_name || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("dateOfBirth").value = user.birthdate || "";
        document.getElementById("address").value = user.address || "";

        const profileImage = document.getElementById("profileImage");
        profileImage.src = `/${user.photo}` || "/storage/img/reader.jpg";
    }

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

    document.getElementById("updateForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const old_password = document.getElementById("old_password").value;
        const password = document.getElementById("password").value;
        const passwordConfirmation = document.getElementById("passwordConfirmation").value;
        const photoFile = document.getElementById("photo").files[0];
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const dateOfBirth = document.getElementById("dateOfBirth").value;
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);

        if(old_password.length >= 4) {
            if(password.length >= 4 && passwordConfirmation.length >= 4 && password === passwordConfirmation) {
                const password_check = await fetch ('http://localhost:8000/api/profile/check', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        'id': current_user.id,
                        'password': old_password,
                    }),
                });
                const pass_check = await password_check.json();
                if(!pass_check.check)
                {
                    alert(`Invalid old password.`);
                    return;
                } else {
                    formData.append("password", password);
                    formData.append("password_confirmation", passwordConfirmation);
                }
            } else {
                alert(`Invalid confirm password.`);
                return
            }
        }

        if (photoFile) {
            formData.append("photo", photoFile);
        } else if (current_user.photo) {
            const originalFileName = current_user.photo.split('/').pop();
            try {
                const photoFileFromUrl = await urlToFile(current_user.photo, originalFileName);
                formData.append("photo", photoFileFromUrl);
            } catch (error) {
                console.error("File type error:", error);
                alert("The photo must be of type jpeg, jpg, or png.");
                return;
            }
        }

        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("birthdate", dateOfBirth);
        formData.append("phone", phone);
        formData.append("address", address);

        try {
            const response = await fetch(`http://localhost:8000/api/users/${current_user.id}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: formData,
            });

            if (response.ok) {
                document.querySelector(".dropdown-toggle").textContent = username;
                document.getElementById("old_password").value = '';
                document.getElementById("password").value = '';
                document.getElementById("passwordConfirmation").value = '';

                alert("Successfully save!");
            } else {
                const error = await response.json();
                console.error("Error response:", error);
            }
        } catch (error) {
            console.error("Save failed:", error);
        }
    });

    const authenticatedUser = await getAuthenticatedUser();
    if (authenticatedUser) {
        current_user = authenticatedUser;
        populateForm(current_user);
        loaderOff();
    } else {
        console.error("Failed to retrieve authenticated user data.");
    }

    usernameInput.addEventListener("input", function () {
        setWidth(usernameInput);
    });

    function setWidth(input) {
        const padding = 20;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = "18px Arial";

        const textWidth = context.measureText(input.value).width;

        if(textWidth < 100) {
            input.style.width = '110px';
        } else {
            input.style.width = `${textWidth + padding}px`;
        }
    }
});


