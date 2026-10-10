import AuthCard from '../components/auth/AuthCard';

/**
 * Sign-in page.
 *
 * The whole auth flow (Sign In / Create Account / Forgot Password) lives in the
 * shared AuthCard component, so /login and /signup stay perfectly consistent.
 */
const Login = () => <AuthCard initialMode="signin" />;

export default Login;
