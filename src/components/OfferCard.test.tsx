import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import OfferCard from './OfferCard';
import { Offer } from '../types/offer';

const mockOffer: Offer = {
  id: '1',
  title: 'Beautiful Apartment',
  type: 'apartment',
  price: 120,
  city: {
    name: 'Paris',
    location: {
      latitude: 48.856613,
      longitude: 2.352222,
      zoom: 10,
    },
  },
  location: {
    latitude: 48.856613,
    longitude: 2.352222,
    zoom: 10,
  },
  isFavorite: false,
  isPremium: false,
  rating: 4.5,
  previewImage: 'test-image.jpg',
};

const renderWithRouter = (component: JSX.Element) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('OfferCard component', () => {
  it('should render card with offer data', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    expect(screen.getByText(mockOffer.title)).toBeInTheDocument();
    expect(screen.getByText(`€${mockOffer.price}`)).toBeInTheDocument();
    expect(screen.getByText(mockOffer.type)).toBeInTheDocument();
    expect(screen.getByAltText('Place image')).toHaveAttribute('src', mockOffer.previewImage);
  });

  it('should display Premium mark when offer.isPremium is true', () => {
    const premiumOffer: Offer = { ...mockOffer, isPremium: true };
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={premiumOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('should not display Premium mark when offer.isPremium is false', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });

  it('should display active favorite button when offer.isFavorite is true', () => {
    const favoriteOffer: Offer = { ...mockOffer, isFavorite: true };
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={favoriteOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const bookmarkButton = screen.getByRole('button');
    expect(bookmarkButton).toHaveClass('place-card__bookmark-button--active');
  });

  it('should call onFavoriteClick when clicking favorite button', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const bookmarkButton = screen.getByRole('button');
    await user.click(bookmarkButton);

    expect(onFavoriteClick).toHaveBeenCalledTimes(1);
    expect(onFavoriteClick).toHaveBeenCalledWith(mockOffer.id);
  });

  it('should pass correct offer.id to onFavoriteClick callback', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();
    const testOffer: Offer = { ...mockOffer, id: 'test-id-123' };

    renderWithRouter(
      <OfferCard
        offer={testOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const bookmarkButton = screen.getByRole('button');
    await user.click(bookmarkButton);

    expect(onFavoriteClick).toHaveBeenCalledWith('test-id-123');
  });

  it('should call onMouseEnter when mouse enters card', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const card = screen.getByRole('article');
    await user.hover(card);

    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('should call onMouseLeave when mouse leaves card', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const card = screen.getByRole('article');
    await user.hover(card);
    await user.unhover(card);

    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should calculate rating width correctly', () => {
    const offerWithRating: Offer = { ...mockOffer, rating: 4.5 };
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={offerWithRating}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const ratingStars = screen.getByText('Rating').parentElement;
    const ratingSpan = ratingStars?.querySelector('span');
    expect(ratingSpan).toHaveStyle({ width: '90%' });
  });

  it('should have link to offer page', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFavoriteClick = vi.fn();

    renderWithRouter(
      <OfferCard
        offer={mockOffer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFavoriteClick={onFavoriteClick}
      />
    );

    const links = screen.getAllByRole('link');
    const offerLink = links.find((link) => link.getAttribute('href') === `/offer/${mockOffer.id}`);
    expect(offerLink).toBeInTheDocument();
  });

  it('should work without optional callbacks', () => {
    renderWithRouter(<OfferCard offer={mockOffer} />);

    expect(screen.getByText(mockOffer.title)).toBeInTheDocument();
  });
});

