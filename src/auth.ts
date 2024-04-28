import { SvelteKitAuth, type Account, type DefaultSession } from '@auth/sveltekit';
import SpotifyProvider from '@auth/sveltekit/providers/spotify';
import { PUBLIC_CLIENT_ID } from '$env/static/public';
import { PRIVATE_CLIENT_SECRET } from '$env/static/private';
import type { AccessToken } from '@spotify/web-api-ts-sdk';
import db from '$lib/db/drizzle';
import { users } from '$lib/db/schema';
import type { JWT } from '@auth/core/jwt';

// We modify the session/token (see `callbacks` below). We need to tell
// TypeScript about the new fields so it doesn't complain.
declare module '@auth/sveltekit' {
	export interface Session {
		user: {
			user_id?: string;
			access_token?: AccessToken;
		} & DefaultSession['user'];
		error?: string;
	}
}

declare module '@auth/core/jwt' {
	export interface JWT {
		user_id?: string;
		access_token?: AccessToken;
		error?: string;
	}
}

// A lot of this is adapted from the next-auth example in the spotify web API SDK
// https://github.com/spotify/spotify-web-api-ts-sdk/blob/main/example_next/src/app/api/auth/%5B...nextauth%5D/SpotifyProfile.ts

// Just specifying the scopes directly in the provider doesn't work
const provider = SpotifyProvider({
	clientId: PUBLIC_CLIENT_ID,
	clientSecret: PRIVATE_CLIENT_SECRET
});
const scopes = ['user-library-read', 'user-read-playback-state', 'user-modify-playback-state'];
const authUrl = new URL(provider.authorization);
authUrl.searchParams.append('scope', scopes.join(' '));
provider.authorization = authUrl.toString();

function createAccessToken(account: Account): AccessToken | undefined {
	if (
		!account.access_token ||
		!account.token_type ||
		!account.expires_in ||
		!account.refresh_token ||
		!account.expires_at
	) {
		return;
	}
	return {
		access_token: account.access_token,
		token_type: account.token_type,
		expires_in: account.expires_in,
		refresh_token: account.refresh_token,
		expires: account.expires_at
	};
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
		// TODO: This doesn't look like it should work
		const response = await fetch(authUrl, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST'
		});

		const refreshedTokens = await response.json();
		if (!response.ok) {
			throw refreshedTokens;
		}

		return {
			...token,
			access_token: {
				access_token: refreshedTokens.access_token,
				token_type: refreshedTokens.token_type,
				expires_in: (refreshedTokens.expires_at ?? 0) - Date.now() / 1000,
				refresh_token: refreshedTokens.refresh_token,
				expires: refreshedTokens.expires_at
			}
		};
	} catch (error) {
		console.error(error);
		return {
			...token,
			error: 'RefreshAccessTokenError'
		};
	}
}

export const { handle } = SvelteKitAuth({
	providers: [provider],
	// We get the access token on the server side, but we need to pass it to the
	// client for the SDK to work. So we add it to the session, see
	// https://authjs.dev/guides/extending-the-session
	callbacks: {
		async jwt({ token, account }) {
			if (!account) {
				// Only available during login, so don't overwrite data otherwise
				return token;
			}

			await db.insert(users).values({ id: account.providerAccountId }).onConflictDoNothing();

			const updatedToken: JWT = {
				...token,
				access_token: createAccessToken(account),
				user_id: account.providerAccountId
			};
			if (
				!updatedToken.access_token?.expires ||
				Date.now() / 1000 > updatedToken.access_token.expires
			) {
				return refreshAccessToken(updatedToken);
			}
			return updatedToken;
		},
		session({ session, token }) {
			const user = {
				...session.user,
				access_token: token.access_token,
				user_id: token.user_id
			};
			session.user = user;
			session.error = token.error;

			return session;
		}
	}
});
