import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetOIDCUserData, mockValidateAndParseCsrfToken, mockUpdateUser, MockOAuthProviderError } =
	vi.hoisted(() => {
		class MockOAuthProviderError extends Error {
			public readonly code: "OAUTH_PROVIDER_UNAVAILABLE" | "OAUTH_PROVIDER_ERROR";
			constructor(
				message: string,
				code: "OAUTH_PROVIDER_UNAVAILABLE" | "OAUTH_PROVIDER_ERROR" = "OAUTH_PROVIDER_ERROR"
			) {
				super(message);
				this.name = "OAuthProviderError";
				this.code = code;
			}
		}

		return {
			mockGetOIDCUserData: vi.fn(),
			mockValidateAndParseCsrfToken: vi.fn(),
			mockUpdateUser: vi.fn(),
			MockOAuthProviderError,
		};
	});

vi.mock("$app/paths", () => ({ base: "" }));
vi.mock("$lib/server/logger", () => ({
	logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));
vi.mock("$lib/server/config", () => ({
	config: {
		ALLOWED_USER_EMAILS: "[]",
		ALLOWED_USER_DOMAINS: "[]",
	},
}));
vi.mock("$lib/server/auth", () => ({
	getOIDCUserData: mockGetOIDCUserData,
	validateAndParseCsrfToken: mockValidateAndParseCsrfToken,
	OAuthProviderError: MockOAuthProviderError,
}));
vi.mock("./updateUser.js", () => ({
	updateUser: mockUpdateUser,
}));

const makeEvent = () => {
	const state = Buffer.from("csrf-token").toString("base64");
	return {
		url: new URL(`http://localhost:5173/login/callback?code=test-code&state=${encodeURIComponent(state)}`),
		locals: { sessionId: "session-123" },
		cookies: {
			get: vi.fn(() => "code-verifier"),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(() => []),
			serialize: vi.fn(),
		},
		request: new Request("http://localhost:5173/login/callback"),
		getClientAddress: vi.fn(() => "127.0.0.1"),
	};
};

describe("login callback structured OAuth provider failures", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockValidateAndParseCsrfToken.mockResolvedValue({
			redirectUrl: "http://localhost:5173/login/callback",
		});
	});

	it("returns 502 with OAUTH_PROVIDER_UNAVAILABLE JSON payload", async () => {
		mockGetOIDCUserData.mockRejectedValue(
			new MockOAuthProviderError("Provider unreachable", "OAUTH_PROVIDER_UNAVAILABLE")
		);
		const { GET } = await import("./+server");

		const response = await GET(makeEvent() as never);
		const body = await response.json();

		expect(response.status).toBe(502);
		expect(response.headers.get("Content-Type")).toContain("application/json");
		expect(body.code).toBe("OAUTH_PROVIDER_UNAVAILABLE");
		expect(body.message).toMatch(/temporarily unavailable/i);
		expect(mockUpdateUser).not.toHaveBeenCalled();
	});

	it("returns 502 with OAUTH_PROVIDER_ERROR JSON payload", async () => {
		mockGetOIDCUserData.mockRejectedValue(
			new MockOAuthProviderError("Provider internal error", "OAUTH_PROVIDER_ERROR")
		);
		const { GET } = await import("./+server");

		const response = await GET(makeEvent() as never);
		const body = await response.json();

		expect(response.status).toBe(502);
		expect(body.code).toBe("OAUTH_PROVIDER_ERROR");
		expect(body.message).toMatch(/error occurred during sign-in/i);
		expect(mockUpdateUser).not.toHaveBeenCalled();
	});
});
