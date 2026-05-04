/**
 * компонент MainPage — главная страница сайта.
 * которая отображает секции из макета main.html
 */

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppRoute } from '../const';
import OffersList from '../components/OffersList';
import Map from '../components/Map';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyMainContent from '../components/EmptyMainContent';
import { City, Points, Point } from '../types/types';
import { Offer } from '../types/offer';
import { AppDispatch } from '../store';
import { changeCity, fetchOffersAction, logoutAction, toggleFavoriteAction } from '../store/action';
import { AuthorizationStatus } from '../const';
import CitiesList from '../components/CitiesList';
import {
  getSelectedCity,
  getFilteredOffers,
  getOffersLoadingStatus,
  getOffersError,
  getAuthorizationStatus,
  getUser,
  getFavoriteOffersCount,
} from '../store/selectors';

const CITIES = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];

type SortType = 'Popular' | 'Price: low to high' | 'Price: high to low' | 'Top rated first';

function MainPage(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const selectedCity = useSelector(getSelectedCity);
  const filteredOffers = useSelector(getFilteredOffers);
  const isOffersDataLoading = useSelector(getOffersLoadingStatus);
  const offersDataError = useSelector(getOffersError);
  const authorizationStatus = useSelector(getAuthorizationStatus);
  const user = useSelector(getUser);
  const favoriteOffersCount = useSelector(getFavoriteOffersCount);

  const [sortType, setSortType] = useState<SortType>('Popular');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<Point | undefined>(undefined);

  const sortedOffers = useMemo(() => {
    const offers = [...filteredOffers];
    switch (sortType) {
      case 'Price: low to high':
        return offers.sort((a, b) => a.price - b.price);
      case 'Price: high to low':
        return offers.sort((a, b) => b.price - a.price);
      case 'Top rated first':
        return offers.sort((a, b) => b.rating - a.rating);
      case 'Popular':
      default:
        return offers;
    }
  }, [filteredOffers, sortType]);

  const cityCoordinates: City = useMemo(() => sortedOffers[0]
    ? {
      lat: sortedOffers[0].city.location.latitude,
      lng: sortedOffers[0].city.location.longitude,
      zoom: sortedOffers[0].city.location.zoom,
    }
    : {
      lat: 52.38333,
      lng: 4.9,
      zoom: 10,
    }, [sortedOffers]);

  const points: Points = useMemo(() => sortedOffers.map((offer: Offer) => ({
    lat: offer.location.latitude,
    lng: offer.location.longitude,
    title: offer.title,
  })), [sortedOffers]);

  useEffect(() => {
    dispatch(fetchOffersAction());
  }, [dispatch]);

  const handleCityChange = useCallback((city: string) => {
    dispatch(changeCity(city));
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const handleFavoriteClick = useCallback((offerId: string) => {
    if (authorizationStatus !== AuthorizationStatus.Auth) {
      navigate(AppRoute.Login);
      return;
    }

    const offer = sortedOffers.find((o) => o.id === offerId);
    if (offer) {
      dispatch(toggleFavoriteAction(offerId, !offer.isFavorite));
    }
  }, [dispatch, navigate, authorizationStatus, sortedOffers]);

  const handleSortTypeChange = useCallback((newSortType: SortType) => {
    setSortType(newSortType);
    setIsSortMenuOpen(false);
  }, []);

  const handleSortMenuToggle = useCallback(() => {
    setIsSortMenuOpen((prev) => !prev);
  }, []);

  const handleSortMenuClose = useCallback(() => {
    setIsSortMenuOpen(false);
  }, []);

  const handleCardMouseEnter = useCallback((offerId: string) => {
    const offer = sortedOffers.find((o) => o.id === offerId);
    if (offer) {
      setSelectedPoint({
        lat: offer.location.latitude,
        lng: offer.location.longitude,
        title: offer.title,
      });
    }
  }, [sortedOffers]);

  const handleCardMouseLeave = useCallback(() => {
    setSelectedPoint(undefined);
  }, []);

  return (
    <div className="page page--gray page--main">
      <header className="header">
        <div className="container">
          <div className="header__wrapper">
            <div className="header__left">
              <Link className="header__logo-link header__logo-link--active" to={AppRoute.Main}>
                <img className="header__logo" src="img/logo.svg" alt="6 cities logo" width="81" height="41" />
              </Link>
            </div>
            <nav className="header__nav">
              <ul className="header__nav-list">
                {authorizationStatus === AuthorizationStatus.Auth && user ? (
                  <>
                    <li className="header__nav-item user">
                      <Link className="header__nav-link header__nav-link--profile" to={AppRoute.Favorites}>
                        <div className="header__avatar-wrapper user__avatar-wrapper">
                          <img className="header__avatar user__avatar" src={user.avatarUrl} alt={user.name} width="20" height="20" />
                        </div>
                        <span className="header__user-name user__name">{user.email}</span>
                        <span className="header__favorite-count">{favoriteOffersCount}</span>
                      </Link>
                    </li>
                    <li className="header__nav-item">
                      <a className="header__nav-link" href="#" onClick={(e) => {
                        e.preventDefault(); handleLogout();
                      }}
                      >
                        <span className="header__signout">Sign out</span>
                      </a>
                    </li>
                  </>
                ) : (
                  <li className="header__nav-item">
                    <Link className="header__nav-link" to={AppRoute.Login}>
                      <span className="header__login">Sign in</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="page__main page__main--index">
        <h1 className="visually-hidden">Cities</h1>
        <CitiesList
          cities={CITIES}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
        />
        <div className="cities">
          <div className={`cities__places-container ${!offersDataError && !isOffersDataLoading && sortedOffers.length === 0 ? 'cities__places-container--empty' : ''} container`}>
            {!offersDataError && !isOffersDataLoading && sortedOffers.length === 0 ? (
              <EmptyMainContent city={selectedCity} />
            ) : (
              <section className="cities__places places">
                <h2 className="visually-hidden">Places</h2>
                {offersDataError && (
                  <ErrorMessage message={offersDataError} />
                )}
                {!offersDataError && isOffersDataLoading && (
                  <Spinner />
                )}
                {!offersDataError && !isOffersDataLoading && (
                  <>
                    <b className="places__found">
                      {sortedOffers.length} places to stay in {selectedCity}
                    </b>
                    <form className="places__sorting" action="#" method="get">
                      <span className="places__sorting-caption">Sort by</span>
                      <span
                        className="places__sorting-type"
                        tabIndex={0}
                        onClick={handleSortMenuToggle}
                        onBlur={handleSortMenuClose}
                      >
                        {sortType}
                        <svg className="places__sorting-arrow" width="7" height="4">
                          <use href="#icon-arrow-select"></use>
                        </svg>
                      </span>
                      <ul className={`places__options places__options--custom ${isSortMenuOpen ? 'places__options--opened' : ''}`}>
                        <li
                          className={`places__option ${sortType === 'Popular' ? 'places__option--active' : ''}`}
                          tabIndex={0}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSortTypeChange('Popular');
                          }}
                        >
                          Popular
                        </li>
                        <li
                          className={`places__option ${sortType === 'Price: low to high' ? 'places__option--active' : ''}`}
                          tabIndex={0}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSortTypeChange('Price: low to high');
                          }}
                        >
                          Price: low to high
                        </li>
                        <li
                          className={`places__option ${sortType === 'Price: high to low' ? 'places__option--active' : ''}`}
                          tabIndex={0}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSortTypeChange('Price: high to low');
                          }}
                        >
                          Price: high to low
                        </li>
                        <li
                          className={`places__option ${sortType === 'Top rated first' ? 'places__option--active' : ''}`}
                          tabIndex={0}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSortTypeChange('Top rated first');
                          }}
                        >
                          Top rated first
                        </li>
                      </ul>
                    </form>
                    <OffersList
                      offers={sortedOffers}
                      onFavoriteClick={handleFavoriteClick}
                      onCardMouseEnter={handleCardMouseEnter}
                      onCardMouseLeave={handleCardMouseLeave}
                    />
                  </>
                )}
              </section>
            )}
            {(!offersDataError && !isOffersDataLoading && sortedOffers.length > 0) && (
              <div className="cities__right-section">
                <Map
                  city={cityCoordinates}
                  points={points}
                  selectedPoint={selectedPoint}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
