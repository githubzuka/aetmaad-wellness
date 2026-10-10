import AuthCard from '../components/auth/AuthCard';

/**
 * Create-account page.
 *
 * Reuses the shared AuthCard (same layout and styling as /login) and simply
 * opens on the "Create Account" tab.
 */
const Signup = () => <AuthCard initialMode="signup" />;

export default Signup;
