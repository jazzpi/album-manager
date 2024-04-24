import { SvelteKitAuth, type Account, type DefaultSession } from '@auth/sveltekit';
import { PUBLIC_CLIENT_ID } from '$env/static/public';
import { PRIVATE_CLIENT_SECRET } from '$env/static/private';
import type { AccessToken } from '@spotify/web-api-ts-sdk';
import db from '$lib/db/drizzle';
import { users } from '$lib/db/schema';

// We modify the session/token (see `callbacks` below). We need to tell
// TypeScript about the new fields so it doesn't complain.
declare module '@auth/sveltekit' {
	export interface Session {
		user: {
			user_id?: string;
			access_token?: AccessToken;
		} & DefaultSession['user'];
	}
}

declare module '@auth/core/jwt' {
	export interface JWT {
		user_id?: string;
		access_token?: AccessToken;
	}
}

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

export const { handle } = SvelteKitAuth({
	providers: [
		// The default spotify provider doesn't allow us to modify the scope, so
		// we roll our own (adapted from the default provider)
		{
			id: 'spotify',
			name: 'Spotify',
			type: 'oauth',
			authorization: {
				url: 'https://accounts.spotify.com/authorize',
				params: { scope: 'user-library-read user-read-playback-state user-modify-playback-state' }
			},
			token: 'https://accounts.spotify.com/api/token',
			userinfo: 'https://api.spotify.com/v1/me',
			profile(profile) {
				return {
					id: profile.id,
					name: profile.display_name,
					email: profile.email,
					image: profile.images?.[0]?.url
				};
			},
			style: { brandColor: '#1db954' },
			clientId: PUBLIC_CLIENT_ID,
			clientSecret: PRIVATE_CLIENT_SECRET,
			checks: ['pkce']
		}
	],
	// We get the access token on the server side, but we need to pass it to the
	// client for the SDK to work. So we add it to the session, see
	// https://authjs.dev/guides/extending-the-session
	callbacks: {
		async jwt({ token, profile, account }) {
			if (!profile || !account) {
				// Only available during login, so don't overwrite data otherwise
				return token;
			}
			// Replace null-profile-ID with undefined
			const id = profile?.id ?? undefined;
			if (id) {
				await db.insert(users).values({ id: id }).onConflictDoNothing();
			}
			token.user_id = id;
			token.access_token = createAccessToken(account);
			return token;
		},
		session({ session, token }) {
			session.user.user_id = token.user_id;
			session.user.access_token = token.access_token;
			return session;
		}
	}
});
