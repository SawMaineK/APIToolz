import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './providers/JWTProvider';

const AuthCallback = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token && authContext) {
      login(token, authContext);
    } else {
      navigate('/admin/login');
    }
  }, []);

  const login = async (token: string, authContext: any) => {
    const auth = {
      access_token: token,
      api_token: token,
      refreshToken: undefined
    };
    authContext.saveAuth(auth);
    const {
      data: { data: user }
    } = await authContext.getUser();
    authContext.setCurrentUser(user);
    navigate('/admin', { replace: true });
  };

  return <p>Completing login...</p>;
};

export default AuthCallback;
