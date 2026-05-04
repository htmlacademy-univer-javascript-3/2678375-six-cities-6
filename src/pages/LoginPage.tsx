import { useState, FormEvent, ChangeEvent, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppRoute } from '../const';
import { AppDispatch } from '../store';
import { loginAction, changeCity } from '../store/action';
import { AuthorizationStatus } from '../const';
import { getAuthorizationStatus } from '../store/selectors';

const CITIES = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authorizationStatus = useSelector(getAuthorizationStatus);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authorizationStatus === AuthorizationStatus.Auth) {
      navigate(AppRoute.Main);
    }
  }, [authorizationStatus, navigate]);

  const handleEmailChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setEmail(evt.target.value);
    setError(null);
  };

  const handlePasswordChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setPassword(evt.target.value);
    setError(null);
  };

  const randomCity = useMemo(() => CITIES[Math.floor(Math.random() * CITIES.length)], []);

  const validatePassword = (pwd: string): boolean => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    return hasLetter && hasDigit;
  };

  const handleQuickCityClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    dispatch(changeCity(randomCity));
    navigate(AppRoute.Main);
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError(null);

    if (password.trim().length === 0) {
      setError('Password cannot be empty or contain only spaces');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must contain at least one letter and one digit');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(loginAction(email, password));
      navigate(AppRoute.Main);
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 400) {
          setError(axiosError.response.data?.message || 'Invalid email or password');
        } else if (axiosError.response?.status === 401) {
          setError('Invalid email or password');
        } else {
          setError('Failed to login. Please try again.');
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page page--gray page--login">
      <header className="header">
        <div className="container">
          <div className="header__wrapper">
            <div className="header__left">
              <Link className="header__logo-link" to={AppRoute.Main}>
                <img className="header__logo" src="img/logo.svg" alt="6 cities logo" width="81" height="41" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="page__main page__main--login">
        <div className="page__login-container container">
          <section className="login">
            <h1 className="login__title">Sign in</h1>
            <form className="login__form form" action="#" method="post" onSubmit={(e) => {
              void handleSubmit(e);
            }}
            >
              {error && (
                <div style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              <div className="login__input-wrapper form__input-wrapper">
                <label className="visually-hidden">E-mail</label>
                <input
                  className="login__input form__input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="login__input-wrapper form__input-wrapper">
                <label className="visually-hidden">Password</label>
                <input
                  className="login__input form__input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                />
              </div>
              <button
                className="login__submit form__submit button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </section>
          <section className="locations locations--login locations--current">
            <div className="locations__item">
              <a className="locations__item-link" href="#" onClick={handleQuickCityClick}>
                <span>{randomCity}</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
