<script>
	import { enhance } from '$app/forms';
	const { data, form } = $props();
</script>

<div class="container">
	<h1>Tools</h1>
	
	<div class="tools-grid">
		<div class="tool-card">
			<h2>Import Videos</h2>
			<form method="post" use:enhance action="?/import">
				<button type="submit" class="btn btn-primary">Import Videos</button>
			</form>
		</div>

		<div class="tool-card">
			<h2>Find Videos</h2>
			<form method="post" use:enhance action="?/find">
				<div class="form-group">
					<textarea 
						name="find" 
						id="find" 
						placeholder="Enter search terms..."
						rows="5"
					></textarea>
				</div>
				<button type="submit" class="btn btn-primary">Find Videos</button>
			</form>

			{#if form?.result?.length > 0}
				<div class="results-section">
					<h3>Search Results</h3>
					<ul class="video-list">
						{#each form.result as video}
							<li>{video.title}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>

	{#if data.videos?.length > 0}
		<div class="all-videos-section">
			<h2>All Videos</h2>
			<ul class="video-list">
				{#each data.videos as video}
					<li>{video.title}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	h1 {
		font-size: 2rem;
		margin-bottom: var(--spacing-xl);
		color: var(--color-text-dark);
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-dark);
	}

	h3 {
		font-size: 1.25rem;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-dark);
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-2xl);
	}

	.tool-card {
		background-color: var(--color-white);
		padding: var(--spacing-xl);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	textarea {
		width: 100%;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-light);
	}

	.btn {
		display: inline-block;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
		vertical-align: middle;
		cursor: pointer;
		padding: var(--spacing-sm) var(--spacing-lg);
		font-size: 1rem;
		border-radius: var(--radius-sm);
		border: none;
		transition: all var(--transition-fast);
		width: 100%;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
	}

	.results-section {
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.video-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.video-list li {
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.video-list li:last-child {
		border-bottom: none;
	}

	.all-videos-section {
		background-color: var(--color-white);
		padding: var(--spacing-xl);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
</style>
