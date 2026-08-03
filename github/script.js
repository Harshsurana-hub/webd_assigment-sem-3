let usernameInputField = document.getElementById("Input");
let searchButton = document.getElementById("Button");
let userProfileCard = document.querySelector(".profile");

searchButton.addEventListener("click", fetchGitHubProfile);

async function fetchGitHubProfile() {
    let targetUsername = usernameInputField.value;
    try {
        const githubResponse = await fetch(`https://api.github.com/users/${targetUsername}`);
        
        if (!githubResponse.ok) {
            throw new Error(`User not found (${githubResponse.status})`);
        }

        const userData = await githubResponse.json();

        document.querySelector('.img').src = userData.avatar_url;
        document.querySelector('.name').textContent = userData.name || userData.login;
    } catch (requestError) {

    }
}
