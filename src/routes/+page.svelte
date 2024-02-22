<script>
	import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';
</script>

<a
	href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${PUBLIC_GOOGLE_REDIRECT}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline&prompt=consent`}
>
	Login With Google</a
>
