# Account registration and passwords

Existing demo accounts have no password hash. They cannot sign in after this update until they verify their email and set a password. Password setup updates the same User row, keeping saved websites attached to that account.

## Existing Neon database

1. Open `prisma/neon-auth-upgrade.sql` and copy the entire file.
2. In Neon SQL Editor, select the branch/database used by Vercel and run it once. It adds two User columns and two authentication tables; existing websites are preserved.
3. In Vercel Production environment variables, configure `NEXTAUTH_SECRET`, `RESEND_API_KEY`, and `AUTH_FROM_EMAIL`. The sender must be verified in Resend. An existing `CONTACT_FROM_EMAIL` is also accepted as the sender if `AUTH_FROM_EMAIL` is absent. Never use a `NEXT_PUBLIC_` prefix for these values.
4. Redeploy the latest commit so environment changes take effect.
5. On the app's login page choose **Set or reset password**, enter the email used for your saved websites, then enter the emailed code and a new password of 12–128 characters.
6. Sign in with that email and password, then open **Saved websites**. Verify that a wrong password fails.

For a new database, run `prisma/neon-initial-setup.sql` followed by `prisma/neon-auth-upgrade.sql` once each, in that order.

## Implementation

- Passwords use asynchronous Node scrypt with random 16-byte salts, N=32768, r=8, p=3, and constant-time hash comparison. Plaintext passwords are never stored.
- Registration and resets require an eight-digit email code. Only an HMAC digest is stored. Codes expire after 15 minutes, are consumed in a transaction, and cannot be reused. Password reset invalidates other outstanding codes.
- Email requests and sign-ins are limited by database counters shared across Vercel instances. Verification attempts are limited to five per email per 15-minute window.
- JWTs carry an account version that is checked against the database on session access. Old demo sessions and sessions issued before a password reset are denied.
- Registration does not replace an existing password. Legacy email case is matched without changing the existing owner ID. Ambiguous legacy accounts differing only in email case require manual review.
- Unused standalone project APIs return 410. Projects continue to save as part of the authenticated portfolio document.
- The tests mock email delivery and database operations; they do not send emails or modify Neon. Live delivery and database setup must be checked after deployment.
