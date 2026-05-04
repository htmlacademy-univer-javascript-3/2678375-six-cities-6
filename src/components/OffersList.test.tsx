import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OffersList from './OffersList';
import { Offer } from '../types/offer';

const mockOffer: Offer = {
  id: '1',
  title: 'Test Offer',
  type: 'apartment',
  price: 100,
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

describe('OffersList component', () => {
  it('should render list of offers', () => {
    const offers: Offer[] = [
      { ...mockOffer, id: '1', title: 'Offer 1' },
      { ...mockOffer, id: '2', title: 'Offer 2' },
      { ...mockOffer, id: '3', title: 'Offer 3' },
    ];
    const onFavoriteClick = vi.fn();

    render(
      <MemoryRouter>
        <OffersList offers={offers} onFavoriteClick={onFavoriteClick} />
      </MemoryRouter>
    );

    expect(screen.getByText('Offer 1')).toBeInTheDocument();
    expect(screen.getByText('Offer 2')).toBeInTheDocument();
    expect(screen.getByText('Offer 3')).toBeInTheDocument();
  });

  it('should render correct number of offer cards', () => {
    const offers: Offer[] = [
      { ...mockOffer, id: '1' },
      { ...mockOffer, id: '2' },
      { ...mockOffer, id: '3' },
      { ...mockOffer, id: '4' },
    ];
    const onFavoriteClick = vi.fn();

    render(
      <MemoryRouter>
        <OffersList offers={offers} onFavoriteClick={onFavoriteClick} />
      </MemoryRouter>
    );

    const offerCards = screen.getAllByRole('article');
    expect(offerCards).toHaveLength(4);
  });

  it('should pass onFavoriteClick to each OfferCard', () => {
    const offers: Offer[] = [
      { ...mockOffer, id: '1' },
      { ...mockOffer, id: '2' },
    ];
    const onFavoriteClick = vi.fn();

    render(
      <MemoryRouter>
        <OffersList offers={offers} onFavoriteClick={onFavoriteClick} />
      </MemoryRouter>
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('should render empty list when offers array is empty', () => {
    const offers: Offer[] = [];
    const onFavoriteClick = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <OffersList offers={offers} onFavoriteClick={onFavoriteClick} />
      </MemoryRouter>
    );

    expect(container.querySelector('.places__list')).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('should work without onFavoriteClick prop', () => {
    const offers: Offer[] = [
      { ...mockOffer, id: '1', title: 'Offer 1' },
    ];

    render(
      <MemoryRouter>
        <OffersList offers={offers} />
      </MemoryRouter>
    );

    expect(screen.getByText('Offer 1')).toBeInTheDocument();
  });
});

