import { memo, useMemo } from 'react';
import { Offer } from '../types/offer';
import { Link } from 'react-router-dom';

export type cardProps = {
  offer: Offer;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFavoriteClick?: (offerId: string) => void;
}

function OfferCardComponent({ offer, onMouseEnter, onMouseLeave, onFavoriteClick }: cardProps): JSX.Element {
  const ratingWidth = useMemo(() => `${Math.round(offer.rating) * 20}%`, [offer.rating]);

  return (
    <article className="cities__card place-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {offer.isPremium ? (
        <div className="place-card__mark">
          <span>Premium</span>
        </div>
      ) : undefined}
      <div className="cities__image-wrapper place-card__image-wrapper">
        <Link to={`/offer/${offer.id}`}>
          <img className="place-card__image" src={offer.previewImage} width="260" height="200" alt="Place image" />
        </Link>
      </div>
      <div className="place-card__info">
        <div className="place-card__price-wrapper">
          <div className="place-card__price">
            <b className="place-card__price-value">&euro;{offer.price}</b>
            <span className="place-card__price-text">&#47;&nbsp;night</span>
          </div>
          <button
            className={`place-card__bookmark-button button ${offer.isFavorite ? 'place-card__bookmark-button--active' : ''}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFavoriteClick?.(offer.id);
            }}
          >
            <svg className="place-card__bookmark-icon" width="18" height="19">
              <use href="#icon-bookmark"></use>
            </svg>
            <span className="visually-hidden">{offer.isFavorite ? 'In bookmarks' : 'To bookmarks'}</span>
          </button>
        </div>
        <div className="place-card__rating rating">
          <div className="place-card__stars rating__stars">
            <span style={{ width: ratingWidth }}></span>
            <span className="visually-hidden">Rating</span>
          </div>
        </div>
        <h2 className="place-card__name">
          <Link to={`/offer/${offer.id}`}>{offer.title}</Link>
        </h2>
        <p className="place-card__type">{offer.type}</p>
      </div>
    </article>
  );
}

const OfferCard = memo(OfferCardComponent);
export default OfferCard;
