import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppRoute, AuthorizationStatus } from '../const';
import { useEffect, useMemo, useCallback, useState } from 'react';
import ReviewForm from '../components/ReviewForm';
import Map from '../components/Map';
import Spinner from '../components/Spinner';
import { getAllOffers, getAuthorizationStatus, getUser, getFavoriteOffersCount, getReviews } from '../store/selectors';
import { AppDispatch } from '../store';
import { toggleFavoriteAction, logoutAction, fetchReviewsAction, loadReviews, fetchOfferAction } from '../store/action';
import { City, Points, Point } from '../types/types';

function OfferPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const allOffers = useSelector(getAllOffers);
  const authorizationStatus = useSelector(getAuthorizationStatus);
  const user = useSelector(getUser);
  const favoriteOffersCount = useSelector(getFavoriteOffersCount);
  const reviews = useSelector(getReviews);
  const [isOfferLoading, setIsOfferLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsOfferLoading(true);
      dispatch(loadReviews([]));
      dispatch(fetchReviewsAction(id));
      dispatch(fetchOfferAction(id))
        .finally(() => {
          setIsOfferLoading(false);
        });
    }
  }, [dispatch, id]);

  const offer = useMemo(() => allOffers.find((o) => o.id === id), [allOffers, id]);

  useEffect(() => {
    if (offer) {
      const nearOffersToLoad = allOffers
        .filter((o) => o.city.name === offer.city.name && o.id !== offer.id)
        .slice(0, 3)
        .filter((o) => !o.previewImage || o.previewImage === '');

      nearOffersToLoad.forEach((nearOffer) => {
        dispatch(fetchOfferAction(nearOffer.id));
      });
    }
  }, [dispatch, offer, allOffers]);

  const hasFullData = offer && offer.images && offer.images.length > 0;

  const ratingWidth = useMemo(() => offer ? `${Math.round(offer.rating) * 20}%` : '0%', [offer]);

  const nearOffers = useMemo(() => {
    if (!offer) {
      return [];
    }
    return allOffers
      .filter((o) => o.city.name === offer.city.name && o.id !== offer.id)
      .slice(0, 3);
  }, [allOffers, offer]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const sortedReviews = useMemo(() => [...reviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10), [reviews]);

  const formatOfferType = (type: string): string => {
    const typeMap: Record<string, string> = {
      apartment: 'Apartment',
      room: 'Room',
      house: 'House',
      hotel: 'Hotel',
    };
    return typeMap[type] || type;
  };

  const mapPoints: Points = useMemo(() => {
    if (!offer) {
      return [];
    }
    const allPoints: Point[] = [
      {
        lat: offer.location.latitude,
        lng: offer.location.longitude,
        title: offer.title,
      },
      ...nearOffers.map((nearOffer) => ({
        lat: nearOffer.location.latitude,
        lng: nearOffer.location.longitude,
        title: nearOffer.title,
      })),
    ];
    return allPoints;
  }, [offer, nearOffers]);

  const mapCity: City = useMemo(() => {
    if (!offer) {
      return { lat: 52.38333, lng: 4.9, zoom: 10 };
    }
    return {
      lat: offer.city.location.latitude,
      lng: offer.city.location.longitude,
      zoom: offer.city.location.zoom,
    };
  }, [offer]);

  const selectedPoint: Point | undefined = useMemo(() => {
    if (!offer) {
      return undefined;
    }
    return {
      lat: offer.location.latitude,
      lng: offer.location.longitude,
      title: offer.title,
    };
  }, [offer]);

  const handleFavoriteClick = useCallback((offerId: string) => {
    if (authorizationStatus !== AuthorizationStatus.Auth) {
      navigate(AppRoute.Login);
      return;
    }

    const targetOffer = allOffers.find((o) => o.id === offerId);
    if (targetOffer) {
      dispatch(toggleFavoriteAction(offerId, !targetOffer.isFavorite));
    }
  }, [dispatch, navigate, authorizationStatus, allOffers]);

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  if (isOfferLoading || !hasFullData) {
    return (
      <div className="page">
        <header className="header">
          <div className="container">
            <div className="header__wrapper">
              <div className="header__left">
                <Link className="header__logo-link" to={AppRoute.Main}>
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
        <main className="page__main page__main--offer">
          <Spinner />
        </main>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="page">
        <h1>Offer not found</h1>
        <Link to={AppRoute.Main}>Go to main page</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="header__wrapper">
            <div className="header__left">
              <Link className="header__logo-link" to={AppRoute.Main}>
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

      <main className="page__main page__main--offer">
        <section className="offer">
          <div className="offer__gallery-container container">
            <div className="offer__gallery">
              {offer.images && offer.images.slice(0, 6).map((image) => (
                <div key={`${image}-${offer.id}`} className="offer__image-wrapper">
                  <img className="offer__image" src={image} alt="Photo studio" />
                </div>
              ))}
            </div>
          </div>
          <div className="offer__container container">
            <div className="offer__wrapper">
              {offer.isPremium && (
                <div className="offer__mark">
                  <span>Premium</span>
                </div>
              )}
              <div className="offer__name-wrapper">
                <h1 className="offer__name">
                  {offer.title}
                </h1>
                <button
                  className={`offer__bookmark-button button ${offer.isFavorite ? 'place-card__bookmark-button--active' : ''}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFavoriteClick(offer.id);
                  }}
                >
                  <svg className="offer__bookmark-icon" width="31" height="33">
                    <use href="#icon-bookmark"></use>
                  </svg>
                  <span className="visually-hidden">{offer.isFavorite ? 'In bookmarks' : 'To bookmarks'}</span>
                </button>
              </div>
              <div className="offer__rating rating">
                <div className="offer__stars rating__stars">
                  <span style={{ width: ratingWidth }}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="offer__rating-value rating__value">{offer.rating}</span>
              </div>
              <ul className="offer__features">
                <li className="offer__feature offer__feature--entire">
                  {formatOfferType(offer.type)}
                </li>
                {offer.bedrooms !== undefined && (
                  <li className="offer__feature offer__feature--bedrooms">
                    {offer.bedrooms} {offer.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  </li>
                )}
                {offer.maxAdults !== undefined && (
                  <li className="offer__feature offer__feature--adults">
                    Max {offer.maxAdults} {offer.maxAdults === 1 ? 'adult' : 'adults'}
                  </li>
                )}
              </ul>
              <div className="offer__price">
                <b className="offer__price-value">&euro;{offer.price}</b>
                <span className="offer__price-text">&nbsp;night</span>
              </div>
              {offer.goods && offer.goods.length > 0 && (
                <div className="offer__inside">
                  <h2 className="offer__inside-title">What&apos;s inside</h2>
                  <ul className="offer__inside-list">
                    {offer.goods.map((good) => (
                      <li key={good} className="offer__inside-item">
                        {good}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {offer.host && (
                <div className="offer__host">
                  <h2 className="offer__host-title">Meet the host</h2>
                  <div className="offer__host-user user">
                    <div className={`offer__avatar-wrapper ${offer.host.isPro ? 'offer__avatar-wrapper--pro' : ''} user__avatar-wrapper`}>
                      <img className="offer__avatar user__avatar" src={offer.host.avatarUrl} width="74" height="74" alt="Host avatar" />
                    </div>
                    <span className="offer__user-name">{offer.host.name}</span>
                    {offer.host.isPro && (
                      <span className="offer__user-status">Pro</span>
                    )}
                  </div>
                  {offer.description && (
                    <div className="offer__description">
                      <p className="offer__text">{offer.description}</p>
                    </div>
                  )}
                </div>
              )}
              <section className="offer__reviews reviews">
                <h2 className="reviews__title">Reviews &middot; <span className="reviews__amount">{sortedReviews.length}</span></h2>
                <ul className="reviews__list">
                  {sortedReviews.map((review) => {
                    const reviewRatingWidth = `${Math.round(review.rating) * 20}%`;
                    return (
                      <li key={review.id} className="reviews__item">
                        <div className="reviews__user user">
                          <div className="reviews__avatar-wrapper user__avatar-wrapper">
                            <img className="reviews__avatar user__avatar" src={review.user.avatarUrl} width="54" height="54" alt="Reviews avatar" />
                          </div>
                          <span className="reviews__user-name">
                            {review.user.name}
                          </span>
                        </div>
                        <div className="reviews__info">
                          <div className="reviews__rating rating">
                            <div className="reviews__stars rating__stars">
                              <span style={{ width: reviewRatingWidth }}></span>
                              <span className="visually-hidden">Rating</span>
                            </div>
                          </div>
                          <p className="reviews__text">
                            {review.comment}
                          </p>
                          <time className="reviews__time" dateTime={review.date}>{formatDate(review.date)}</time>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {authorizationStatus === AuthorizationStatus.Auth && <ReviewForm />}
              </section>
            </div>
          </div>
          {mapPoints.length > 0 && (
            <section className="offer__map map">
              <Map city={mapCity} points={mapPoints} selectedPoint={selectedPoint} />
            </section>
          )}
        </section>
        <div className="container">
          <section className="near-places places">
            <h2 className="near-places__title">Other places in the neighbourhood</h2>
            <div className="near-places__list places__list">
              {nearOffers.map((nearOffer) => {
                const nearRatingWidth = `${Math.round(nearOffer.rating) * 20}%`;
                return (
                  <article key={nearOffer.id} className="near-places__card place-card">
                    {nearOffer.isPremium && (
                      <div className="place-card__mark">
                        <span>Premium</span>
                      </div>
                    )}
                    <div className="near-places__image-wrapper place-card__image-wrapper">
                      <Link to={`/offer/${nearOffer.id}`}>
                        <img className="place-card__image" src={nearOffer.previewImage} width="260" height="200" alt="Place image" />
                      </Link>
                    </div>
                    <div className="place-card__info">
                      <div className="place-card__price-wrapper">
                        <div className="place-card__price">
                          <b className="place-card__price-value">&euro;{nearOffer.price}</b>
                          <span className="place-card__price-text">&#47;&nbsp;night</span>
                        </div>
                        <button
                          className={`place-card__bookmark-button button ${nearOffer.isFavorite ? 'place-card__bookmark-button--active' : ''}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFavoriteClick(nearOffer.id);
                          }}
                        >
                          <svg className="place-card__bookmark-icon" width="18" height="19">
                            <use href="#icon-bookmark"></use>
                          </svg>
                          <span className="visually-hidden">{nearOffer.isFavorite ? 'In bookmarks' : 'To bookmarks'}</span>
                        </button>
                      </div>
                      <div className="place-card__rating rating">
                        <div className="place-card__stars rating__stars">
                          <span style={{ width: nearRatingWidth }}></span>
                          <span className="visually-hidden">Rating</span>
                        </div>
                      </div>
                      <h2 className="place-card__name">
                        <Link to={`/offer/${nearOffer.id}`}>{nearOffer.title}</Link>
                      </h2>
                      <p className="place-card__type">{nearOffer.type}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default OfferPage;
