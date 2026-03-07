import { writable } from "svelte/store";

export const ERROR_MESSAGES = {
	default: "Oops, something went wrong.",
	authOnly: "You have to be logged in.",
	rateLimited: "You are sending too many messages. Try again later.",
	oauthProviderUnavailable: "Authentication service is currently unavailable. Please try again later.",
	oauthProviderError: "Authentication failed. Please try again.",
};

export const error = writable<string | undefined>(undefined);
