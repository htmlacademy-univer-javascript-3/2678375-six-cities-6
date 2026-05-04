import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import FavoriteCard from './FavoriteCard';
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
  isFavorite: true,
  isPremium: false,
  rating: 4.5,
  previewImage: 'test-image.jpg',
};

const renderWithRouter = (component: JSX.Element) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('FavoriteCard component', () => {
  it('should render favorite card with offer data', () => {
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    expect(screen.getByText(mockOffer.title)).toBeInTheDocument();
    expect(screen.getByText(`€${mockOffer.price}`)).toBeInTheDocument();
    expect(screen.getByText(mockOffer.type)).toBeInTheDocument();
    expect(screen.getByAltText('Place image')).toHaveAttribute('src', mockOffer.previewImage);
  });

  it('should display Premium mark when offer.isPremium is true', () => {
    const premiumOffer: Offer = { ...mockOffer, isPremium: true };
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={premiumOffer} onFavoriteClick={onFavoriteClick} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('should not display Premium mark when offer.isPremium is false', () => {
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });

  it('should always display active favorite button', () => {
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    const bookmarkButton = screen.getByRole('button');
    expect(bookmarkButton).toHaveClass('place-card__bookmark-button--active');
  });

  it('should call onFavoriteClick when clicking favorite button', async () => {
    const user = userEvent.setup();
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    const bookmarkButton = screen.getByRole('button');
    await user.click(bookmarkButton);

    expect(onFavoriteClick).toHaveBeenCalledTimes(1);
    expect(onFavoriteClick).toHaveBeenCalledWith(mockOffer.id);
  });

  it('should pass correct offer.id to onFavoriteClick callback', async () => {
    const user = userEvent.setup();
    const onFavoriteClick = vi.fn();
    const testOffer: Offer = { ...mockOffer, id: 'favorite-id-456' };

    renderWithRouter(<FavoriteCard offer={testOffer} onFavoriteClick={onFavoriteClick} />);

    const bookmarkButton = screen.getByRole('button');
    await user.click(bookmarkButton);

    expect(onFavoriteClick).toHaveBeenCalledWith('favorite-id-456');
  });

  it('should calculate rating width correctly', () => {
    const offerWithRating: Offer = { ...mockOffer, rating: 3.8 };
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={offerWithRating} onFavoriteClick={onFavoriteClick} />);

    const ratingStars = screen.getByText('Rating').parentElement;
    const ratingSpan = ratingStars?.querySelector('span');
    expect(ratingSpan).toHaveStyle({ width: '80%' });
  });

  it('should have link to offer page', () => {
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    const links = screen.getAllByRole('link');
    const offerLink = links.find((link) => link.getAttribute('href') === `/offer/${mockOffer.id}`);
    expect(offerLink).toBeInTheDocument();
  });

  it('should work without onFavoriteClick prop', () => {
    renderWithRouter(<FavoriteCard offer={mockOffer} />);

    expect(screen.getByText(mockOffer.title)).toBeInTheDocument();
  });

  it('should display "In bookmarks" text for favorite button', () => {
    const onFavoriteClick = vi.fn();

    renderWithRouter(<FavoriteCard offer={mockOffer} onFavoriteClick={onFavoriteClick} />);

    expect(screen.getByText('In bookmarks')).toBeInTheDocument();
  });
});

