<script lang="ts">
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import { error as errorStore, ERROR_MESSAGES } from "$lib/stores/errors";

	interface Props {
		/** Optional CSS classes to apply to the button element. */
		classNames?: string;
		/** Text label for the button. */
		label?: string;
	}

	let { classNames = "", label = "Sign in" }: Props = $props();

	const OAUTH_ERROR_MESSAGES: Record<string, string> = {
		OAUTH_PROVIDER_UNAVAILABLE:
			"Sign-in service is temporarily unavailable. Please try again later.",
		OAUTH_PROVIDER_ERROR: "An error occurred during sign-in. Please try again.",
	};

	onMount(() => {
		const errorCode = page.url.searchParams.get("error");
		if (!errorCode) return;

		errorStore.set(OAUTH_ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default);
	});

	function onSignIn() {
		window.location.assign(`${base}/login`);
	}
</script>

<button type="button" class={classNames} on:click={onSignIn}>
	{label}
</button>
