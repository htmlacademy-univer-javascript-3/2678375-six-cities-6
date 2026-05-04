import { memo, useMemo } from 'react';
import { Offer } from '../types/offer';
import { Link } from 'react-router-dom';

interface FavoriteCardProps {
  offer: Offer;
  onFavoriteClick?: (offerId: string) => void;
}

function FavoriteCardComponent({ offer, onFavoriteClick }: FavoriteCardProps): JSX.Element {
  const ratingWidth = useMemo(() => `${Math.round(offer.rating) * 20}%`, [offer.rating]);

  return (
    <article className="favorites__card place-card">
      {offer.isPremium ? (
        <div className="place-card__mark">
          <span>Premium</span>
        </div>
      ) : undefined}
      <div className="favorites__image-wrapper place-card__image-wrapper">
        <Link to={`/offer/${offer.id}`}>
          <img className="place-card__image" src={offer.previewImage} width="150" height="110" alt="Place image" />
        </Link>
      </div>
      <div className="favorites__card-info place-card__info">
        <div className="place-card__price-wrapper">
          <div className="place-card__price">
            <b className="place-card__price-value">&euro;{offer.price}</b>
            <span className="place-card__price-text">&#47;&nbsp;night</span>
          </div>
          <button
            className="place-card__bookmark-button place-card__bookmark-button--active button"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFavoriteClick?.(offer.id);
            }}
          >
            <svg className="place-card__bookmark-icon" width="18" height="19">
              <use href="#icon-bookmark"></use>
            </svg>
            <span className="visually-hidden">In bookmarks</span>
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

const FavoriteCard = memo(FavoriteCardComponent);
export default FavoriteCard;
