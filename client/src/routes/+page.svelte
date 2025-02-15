<script>
	let username = '';
	let password = '';
	let errorMessage = '';

	const handleLogin = () => {
		if (username === 'admin' && password === 'admin') {
			errorMessage = '';
			alert('Login successful');
			// You can navigate to the dashboard here
		} else {
			errorMessage = 'Invalid credentials';
		}
	};
</script>

<div class="login-container">
	<div class="login-box">
		<h2>Login</h2>

		<div class="input-group">
			<label for="username">Username</label>
			<input type="text" id="username" bind:value={username} />
		</div>

		<div class="input-group">
			<label for="password">Password</label>
			<input type="password" id="password" bind:value={password} />
		</div>

		<button on:click={handleLogin}>Login</button>

		{#if errorMessage}
			<div class="error-message">{errorMessage}</div>
		{/if}
	</div>
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-color: #f3f4f6;
	}

	.login-box {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		width: 25%;
	}

	.input-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}

	button {
		background-color: #3b82f6;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 1rem;
	}

	button:hover {
		background-color: #2563eb;
	}

	.error-message {
		color: red;
		margin-top: 1rem;
	}
</style>
