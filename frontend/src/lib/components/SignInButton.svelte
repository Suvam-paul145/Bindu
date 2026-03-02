<script lang="ts">
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import { error as errorStore } from "$lib/stores/errors";

	interface Props {
		/** Optional CSS classes to apply to the button element. */
		classNames?: string;
		/** Text label for the button. */
		label?: string;
	}

	let { classNames = "", label = "Sign in" }: Props = $props();

	/**
	 * Map server-returned OAuth error codes to human-readable messages shown in the toast.
	 * These codes are set by triggerOauthFlow / callback +server.ts when a provider fails.
	 */
	const OAUTH_ERROR_MESSAGES: Record<string, string> = {
		OAUTH_PROVIDER_UNAVAILABLE:
			"Sign-in service is temporarily unavailable. Please try again later.",
		OAUTH_PROVIDER_ERROR: "An error occurred during sign-in. Please try again.",
	};

	/**
	 * On mount, check for an `?error=` query param that the server sets when OAuth fails.
	 * Display the appropriate toast message via the shared error store.
	 */
	onMount(() => {
		const errorCode = page.url.searchParams.get("error");
		if (errorCode && errorCode in OAUTH_ERROR_MESSAGES) {
			errorStore.set(OAUTH_ERROR_MESSAGES[errorCode]);
		} else if (errorCode) {
			// Unknown error code — show a generic message
			errorStore.set(OAUTH_ERROR_MESSAGES["OAUTH_PROVIDER_ERROR"]);
		}
	});

	async function handleSignIn() {
		try {
			const response = await fetch(`${base}/login`);

			let data: any = null;
			try {
				data = await response.json();
			} catch {
				// Response is not JSON; leave `data` as null.
			}

			if (!response.ok) {
				const errorCode = data?.error ?? data?.code;
				if (errorCode && errorCode in OAUTH_ERROR_MESSAGES) {
					errorStore.set(OAUTH_ERROR_MESSAGES[errorCode]);
				} else if (data?.message && typeof data.message === "string") {
					errorStore.set(data.message);
				} else {
					errorStore.set(OAUTH_ERROR_MESSAGES["OAUTH_PROVIDER_ERROR"]);
				}
				return;
			}

			const redirectUrl =
				(typeof data?.redirectUrl === "string" && data.redirectUrl) ||
				(typeof data?.url === "string" && data.url);

			if (redirectUrl) {
				window.location.href = redirectUrl;
			} else {
				// Fallback to existing behavior if no URL is provided in the JSON.
				window.location.href = `${base}/login`;
			}
		} catch {
			// Network or unexpected error — treat as provider unavailable.
			errorStore.set(OAUTH_ERROR_MESSAGES["OAUTH_PROVIDER_UNAVAILABLE"]);
		}
	}
</script>

<button
	id="sign-in-btn"
	type="button"
	class="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700 {classNames}"
	onclick={handleSignIn}
>
	{label}
</button>
