import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useMap from './use-map';
import { City } from '../types/types';

// Mock Leaflet
const mockMapInstance = {
  setView: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
};

const mockTileLayer = vi.fn();
const mockMap = vi.fn().mockImplementation(() => mockMapInstance);
const mockTileLayerConstructor = vi.fn().mockImplementation(() => mockTileLayer);

vi.mock('leaflet', () => ({
  Map: mockMap,
  TileLayer: mockTileLayerConstructor,
}));

describe('useMap hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize map on first render when mapRef.current is not null', () => {
    const mapRef = { current: document.createElement('div') };
    const city: City = { lat: 52.370216, lng: 4.895168, zoom: 10 };

    const { result } = renderHook(() => useMap(mapRef, city));

    expect(mockMap).toHaveBeenCalledWith(mapRef.current, {
      center: {
        lat: city.lat,
        lng: city.lng,
      },
      zoom: city.zoom,
    });
    expect(mockTileLayerConstructor).toHaveBeenCalled();
    expect(mockMapInstance.addLayer).toHaveBeenCalled();
    expect(result.current).toBe(mockMapInstance);
  });

  it('should return null if mapRef.current is null', () => {
    const mapRef = { current: null };
    const city: City = { lat: 52.370216, lng: 4.895168, zoom: 10 };

    const { result } = renderHook(() => useMap(mapRef, city));

    expect(result.current).toBeNull();
  });

  it('should not create new map instance on re-render', () => {
    const mapRef = { current: document.createElement('div') };
    const city: City = { lat: 52.370216, lng: 4.895168, zoom: 10 };

    const { result, rerender } = renderHook(() => useMap(mapRef, city));
    const firstMapInstance = result.current;

    rerender();

    expect(mockMap).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstMapInstance);
  });

  it('should update map view when city changes', () => {
    const mapRef = { current: document.createElement('div') };
    const city1: City = { lat: 52.370216, lng: 4.895168, zoom: 10 };
    const city2: City = { lat: 48.856613, lng: 2.352222, zoom: 12 };

    const { rerender } = renderHook(
      ({ city }) => useMap(mapRef, city),
      { initialProps: { city: city1 } }
    );

    rerender({ city: city2 });

    expect(mockMapInstance.setView).toHaveBeenCalledWith(
      [city2.lat, city2.lng],
      city2.zoom
    );
  });

  it('should use default zoom value when zoom is not provided', () => {
    const mapRef = { current: document.createElement('div') };
    const city: City = { lat: 52.370216, lng: 4.895168 };

    renderHook(() => useMap(mapRef, city));

    expect(mockMap).toHaveBeenCalledWith(mapRef.current, {
      center: {
        lat: city.lat,
        lng: city.lng,
      },
      zoom: 10,
    });
  });

  it('should update map view with default zoom when city changes and zoom is not provided', () => {
    const mapRef = { current: document.createElement('div') };
    const city1: City = { lat: 52.370216, lng: 4.895168, zoom: 10 };
    const city2: City = { lat: 48.856613, lng: 2.352222 };

    const { rerender } = renderHook(
      ({ city }) => useMap(mapRef, city),
      { initialProps: { city: city1 } }
    );

    rerender({ city: city2 });

    expect(mockMapInstance.setView).toHaveBeenCalledWith(
      [city2.lat, city2.lng],
      10
    );
  });
});

