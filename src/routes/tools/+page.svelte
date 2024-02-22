<script>
	import { enhance } from '$app/forms';
	const { data, form } = $props();
</script>

<h1>Tools</h1>
<form method="post" use:enhance action="?/import">
	<button type="submit">Import</button>
</form>

<form method="post" use:enhance action="?/find">
	<textarea name="find" id="find" cols="30" rows="10"></textarea>
	<button type="submit">Find</button>
</form>

<ul id="found">
	{#each form?.result || [] as video}
		<li>{video.title}</li>
	{/each}
</ul>

<h2>All Videos</h2>
<ul>
	{#each data.videos as video}
		<li>{video.title}</li>
	{/each}
</ul>
