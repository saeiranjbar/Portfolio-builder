export function loginErrorMessage(error: string | null | undefined): string {
  switch (error) {
    case 'CredentialsSignin':
      return 'Sign-in was rejected. Check your email and password.';
    case 'TooManyAttempts':
      return 'Too many sign-in attempts. Please try again in 15 minutes.';
    case 'Configuration':
      return 'Sign-in is not configured correctly. Check the server authentication settings.';
    case 'DatabaseNotReady':
      return 'Sign-in is unavailable because the database tables are not ready.';
    case 'DatabaseSignInFailed':
      return 'Sign-in could not connect to your account database. Please try again.';
    default:
      return 'Sign-in failed because of a server or connection error. Please try again.';
  }
}
