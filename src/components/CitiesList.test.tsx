import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CitiesList from './CitiesList';

describe('CitiesList component', () => {
  it('should render list of cities', () => {
    const cities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];
    const selectedCity = 'Paris';
    const onCityChange = vi.fn();

    render(<CitiesList cities={cities} selectedCity={selectedCity} onCityChange={onCityChange} />);

    cities.forEach((city) => {
      expect(screen.getByText(city)).toBeInTheDocument();
    });
  });

  it('should display active city with tabs__item--active class', () => {
    const cities = ['Paris', 'Cologne', 'Brussels'];
    const selectedCity = 'Cologne';
    const onCityChange = vi.fn();

    render(<CitiesList cities={cities} selectedCity={selectedCity} onCityChange={onCityChange} />);

    const activeLink = screen.getByText(selectedCity).closest('a');
    expect(activeLink).toHaveClass('tabs__item--active');
  });

  it('should call onCityChange when clicking on a city', async () => {
    const user = userEvent.setup();
    const cities = ['Paris', 'Cologne', 'Brussels'];
    const selectedCity = 'Paris';
    const onCityChange = vi.fn();

    render(<CitiesList cities={cities} selectedCity={selectedCity} onCityChange={onCityChange} />);

    const cologneLink = screen.getByText('Cologne').closest('a');
    await user.click(cologneLink!);

    expect(onCityChange).toHaveBeenCalledTimes(1);
    expect(onCityChange).toHaveBeenCalledWith('Cologne');
  });

  it('should pass correct city to onCityChange callback', async () => {
    const user = userEvent.setup();
    const cities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam'];
    const selectedCity = 'Paris';
    const onCityChange = vi.fn();

    render(<CitiesList cities={cities} selectedCity={selectedCity} onCityChange={onCityChange} />);

    const amsterdamLink = screen.getByText('Amsterdam').closest('a');
    await user.click(amsterdamLink!);

    expect(onCityChange).toHaveBeenCalledWith('Amsterdam');
  });

  it('should not mark non-selected cities as active', () => {
    const cities = ['Paris', 'Cologne', 'Brussels'];
    const selectedCity = 'Paris';
    const onCityChange = vi.fn();

    render(<CitiesList cities={cities} selectedCity={selectedCity} onCityChange={onCityChange} />);

    const cologneLink = screen.getByText('Cologne').closest('a');
    const brusselsLink = screen.getByText('Brussels').closest('a');

    expect(cologneLink).not.toHaveClass('tabs__item--active');
    expect(brusselsLink).not.toHaveClass('tabs__item--active');
  });
});

