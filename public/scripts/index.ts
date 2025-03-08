let token = "";

const loggedIn = async (loginBox: HTMLDivElement) => {
	// Remove the login box
	loginBox.remove();

	// Create the config copier div
	const configCopier = document.createElement("div");
	configCopier.id = "configCopier";
	configCopier.className = "container";

	// Create heading for the config copier
	const configHeading = document.createElement("h2");
	configHeading.textContent = "Config Saver";

	// Create text for the config copier
	const configText = document.createElement("h3");
	configText.textContent =
		"Paste this into your destination settings in sharex!";

	// Create the config content (JSON string) element
	const config = document.createElement("pre");
	config.textContent = `
{
  "Version": "17.0.0",
  "Name": "tinnyterr",
  "DestinationType": "ImageUploader, FileUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://tinnyterr-cdn.uk/api/files/upload",
  "Headers": {
    "Authorization": "Bearer ..."
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "{json:fileUrl}",
  "ThumbnailURL": "{json:thumbnailUrl}",
  "DeletionURL": "{json:deleteUrl}",
  "ErrorMessage": "{json:data}"
}`;

	const copyButton = document.createElement("button");
	copyButton.textContent = "Copy your config";
	copyButton.id = "configCopierButton";

	copyButton.addEventListener("click", () => {
		// Select the text in the input field
		const textToCopy = `
{
  "Version": "17.0.0",
  "Name": "tinnyterr",
  "DestinationType": "ImageUploader, FileUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://tinnyterr-cdn.uk/api/files/upload",
  "Headers": {
    "Authorization": "Bearer ${localStorage.getItem("token") ?? token}"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "{json:fileUrl}",
  "ThumbnailURL": "{json:thumbnailUrl}",
  "DeletionURL": "{json:deleteUrl}",
  "ErrorMessage": "{json:data}"
}`;

		// Copy the selected text to clipboard using Clipboard API
		navigator.clipboard.writeText(textToCopy).catch((err) => {
			console.error("Error copying text: ", err);
		});
	});

	// Append heading, text, and config to configCopier div
	configCopier.appendChild(configHeading);
	configCopier.appendChild(configText);
	configCopier.appendChild(copyButton);
	configCopier.appendChild(config);

	// Append configCopier div to the body
	document.body.appendChild(configCopier);

	// Create the text saver div
	const textSaver = document.createElement("div");
	textSaver.id = "textSaver";
	textSaver.className = "container";

	// Create heading for the text saver
	const heading = document.createElement("h2");
	heading.textContent = "Text Saver";

	// Create the form for saving text
	const textForm = document.createElement("form");
	textForm.id = "textForm";

	// Create a textarea for the user to enter text
	const textArea = document.createElement("textarea");
	textArea.id = "textBox";
	textArea.name = "textBox";
	textArea.rows = 4;
	textArea.cols = 50;

	const res = await fetch("https://tinnyterr-cdn.uk/api/text/get", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token") ?? token}`,
		},
	});

	if (!res.ok) alert("dead");
	else textArea.textContent = (await res.json()).data;

	// Create submit button for the form
	const saveButton = document.createElement("input");
	saveButton.type = "submit";
	saveButton.value = "Save Text";

	// Append everything to the text saver form
	textForm.appendChild(textArea);
	textForm.appendChild(saveButton);

	// Append heading and form to the text saver div
	textSaver.appendChild(heading);
	textSaver.appendChild(textForm);

	// Append the text saver div to the body
	document.body.appendChild(textSaver);

	// Add event listener to the new text form for saving text
	textForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const textValue = textArea.value; // Using value of textarea directly

		try {
			const res = await fetch("https://tinnyterr-cdn.uk/api/text/set", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token") ?? token}`,
				},
				body: JSON.stringify({
					data: textValue,
				}),
			});

			if (!res.ok) {
				const errorMsg = document.createElement("p");
				errorMsg.textContent = "Failed to save text. Try again.";
				errorMsg.style.color = "red";
				textSaver.appendChild(errorMsg);
			} else {
				const successMsg = document.createElement("p");
				successMsg.textContent = "Text saved successfully!";
				successMsg.style.color = "green";
				textSaver.appendChild(successMsg);
			}
		} catch (error) {
			console.error("Error during text save:", error);
			const errorMsg = document.createElement("p");
			errorMsg.textContent = "Something went wrong. Try again later.";
			errorMsg.style.color = "red";
			textSaver.appendChild(errorMsg);
		}
	});

	// Create a logout button
	const logoutButton = document.createElement("button");
	logoutButton.textContent = "Logout";
	logoutButton.id = "logoutButton";

	// Add a click event listener to handle the logout action
	logoutButton.addEventListener("click", () => {
		// Clear the token from localStorage (or handle your logout logic here)
		localStorage.setItem("token", "");
		token = "";

		// Redirect to login page or refresh
		window.location.reload(); // Reload the page or redirect to login page
	});

	// Append the logout button to the body (or place it wherever you like)
	textSaver.appendChild(logoutButton);
};

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
		typeof Storage !== "undefined" &&
		localStorage.getItem("token") &&
		localStorage.getItem("token") !== "" // Ensure it's not an empty string
	) {
		return loggedIn(loginBox);
	}

	// Add event listener for form submission
	formElem?.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(formElem);

		try {
			const res = await fetch("https://tinnyterr-cdn.uk/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: formData.get("username"),
					password: formData.get("password"),
				}),
			});

			if (!res.ok) {
				// Handle error if the login fails
				const errorMsg = document.createElement("p");
				errorMsg.textContent = "Login failed. Please try again.";
				errorMsg.style.color = "red";

				const existingError = document.querySelector("#loginBox p");
				if (existingError) {
					existingError.remove();
				}
				loginBox.insertAdjacentElement("beforeend", errorMsg);
			} else {
				const result = await res.text();

				try {
					localStorage.setItem("token", result);
				} catch {
					token = result;
				}

				loggedIn(loginBox);
			}
		} catch (error) {
			console.error("Error during login request:", error);
			const errorMsg = document.createElement("p");
			errorMsg.textContent = `Something went wrong. Please try again later. ${error}`;
			errorMsg.style.color = "red";

			const existingError = document.querySelector("#loginBox p");
			if (existingError) {
				existingError.remove();
			}
			loginBox.insertAdjacentElement("beforeend", errorMsg);
		}
	});
});
