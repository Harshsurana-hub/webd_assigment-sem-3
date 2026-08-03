let input = document.getElementById("Input");
let Button = document.getElementById("Button");
let profile = document.querySelector(".profile");

Button.addEventListener("click", fetchprofile);

async function fetchprofile() {
    let username = input.value;
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        


        if (!response.ok) {
            throw new Error(`User not found (${response.status})`);
        }

        const data = await response.json();

        document.querySelector('.img').src = data.avatar_url;
        document.querySelector('.name').textContent = data.name || data.login;
    } catch (error) {
        

    }
}