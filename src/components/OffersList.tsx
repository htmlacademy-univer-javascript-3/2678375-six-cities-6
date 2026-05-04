import OfferCard from './OfferCard';
import { Offer } from '../types/offer';

interface OffersListProps {
  offers: Offer[];
  onFavoriteClick?: (offerId: string) => void;
  onCardMouseEnter?: (offerId: string) => void;
  onCardMouseLeave?: () => void;
}

function OffersList({ offers, onFavoriteClick, onCardMouseEnter, onCardMouseLeave }: OffersListProps): JSX.Element {
  return (
    <div className="cities__places-list places__list tabs__content">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onMouseEnter={() => onCardMouseEnter?.(offer.id)}
          onMouseLeave={onCardMouseLeave}
          onFavoriteClick={onFavoriteClick}
        />
      ))}
    </div>
  );
}

export default OffersList;

