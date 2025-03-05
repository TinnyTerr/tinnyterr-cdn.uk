document.addEventListener("DOMContentLoaded", () => {
    // Create the login box div
    const loginBox = document.createElement("div");
    loginBox.id = "loginBox";
    loginBox.className = "container";

    // Create the form
    const formElem = document.createElement("form");
    formElem.id = "loginForm";

    // Create the heading for login
    const heading = document.createElement("h2");
    heading.textContent = "Login";

    // Create the username label and input
    const usernameLabel = document.createElement("label");
    usernameLabel.setAttribute("for", "username");
    usernameLabel.textContent = "Username:";

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.id = "username";
    usernameInput.name = "username";

    // Create line break for formatting
    const br1 = document.createElement("br");

    // Create the password label and input
    const passwordLabel = document.createElement("label");
    passwordLabel.setAttribute("for", "password");
    passwordLabel.textContent = "Password:";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";

    // Create line break for formatting
    const br2 = document.createElement("br");

    // Create the submit button
    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Login";

    // Append everything to the form
    formElem.appendChild(usernameLabel);
    formElem.appendChild(usernameInput);
    formElem.appendChild(br1);
    formElem.appendChild(passwordLabel);
    formElem.appendChild(passwordInput);
    formElem.appendChild(br2);
    formElem.appendChild(submitButton);

    // Append heading and form to the login box
    loginBox.appendChild(heading);
    loginBox.appendChild(formElem);

    // Append the login box to the body
    document.body.appendChild(loginBox);

    if (
        typeof Storage === "undefined" &&
        (typeof localStorage.getItem("token") !== "undefined" ||
            localStorage.getItem("token") !== null)
    )
        return loggedIn(loginBox);
});
