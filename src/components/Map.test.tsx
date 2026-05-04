import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Map from './Map';
import { City, Point } from '../types/types';

const mockMapInstance = {
  setView: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
};

const mockMarkerInstance = {
  setIcon: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
};

const mockLayerGroupInstance = {
  addTo: vi.fn().mockReturnThis(),
};

const mockIcon = vi.fn();
const mockMarker = vi.fn().mockImplementation(() => mockMarkerInstance);
const mockLayerGroup = vi.fn().mockImplementation(() => mockLayerGroupInstance);
const mockIconConstructor = vi.fn().mockImplementation(() => mockIcon);

vi.mock('leaflet', () => ({
  Map: vi.fn().mockImplementation(() => mockMapInstance),
  TileLayer: vi.fn(),
  Marker: mockMarker,
  layerGroup: mockLayerGroup,
  Icon: mockIconConstructor,
}));

const mockUseMap = vi.fn();
vi.mock('../hooks/use-map', () => ({
  default: mockUseMap,
}));

describe('Map component', () => {
  const mockCity: City = {
    lat: 52.370216,
    lng: 4.895168,
    zoom: 10,
  };

  const mockPoints: Point[] = [
    { lat: 52.370216, lng: 4.895168, title: 'Point 1' },
    { lat: 52.380216, lng: 4.890168, title: 'Point 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMap.mockReturnValue(mockMapInstance);
  });

  it('should render map container', () => {
    const { container } = render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    const mapContainer = container.querySelector('.cities__map.map');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should create markers for all points', () => {
    render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    expect(mockMarker).toHaveBeenCalledTimes(2);
    expect(mockMarker).toHaveBeenCalledWith({
      lat: mockPoints[0].lat,
      lng: mockPoints[0].lng,
    });
    expect(mockMarker).toHaveBeenCalledWith({
      lat: mockPoints[1].lat,
      lng: mockPoints[1].lng,
    });
  });

  it('should use default icon for points when selectedPoint is undefined', () => {
    render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    expect(mockIconConstructor).toHaveBeenCalled();
    expect(mockMarkerInstance.setIcon).toHaveBeenCalled();
  });

  it('should use current icon for selectedPoint', () => {
    const selectedPoint: Point = { lat: 52.370216, lng: 4.895168, title: 'Point 1' };
    render(<Map city={mockCity} points={mockPoints} selectedPoint={selectedPoint} />);

    expect(mockMarkerInstance.setIcon).toHaveBeenCalled();
  });

  it('should use default icon for non-selected points', () => {
    const selectedPoint: Point = { lat: 52.370216, lng: 4.895168, title: 'Point 1' };
    render(<Map city={mockCity} points={mockPoints} selectedPoint={selectedPoint} />);

    expect(mockMarkerInstance.setIcon).toHaveBeenCalled();
  });

  it('should update markers when points change', () => {
    const { rerender } = render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    const newPoints: Point[] = [
      { lat: 52.390216, lng: 4.900168, title: 'Point 3' },
    ];

    rerender(<Map city={mockCity} points={newPoints} selectedPoint={undefined} />);

    expect(mockMarker).toHaveBeenCalledWith({
      lat: newPoints[0].lat,
      lng: newPoints[0].lng,
    });
  });

  it('should update markers when selectedPoint changes', () => {
    const selectedPoint1: Point = { lat: 52.370216, lng: 4.895168, title: 'Point 1' };
    const { rerender } = render(<Map city={mockCity} points={mockPoints} selectedPoint={selectedPoint1} />);

    const selectedPoint2: Point = { lat: 52.380216, lng: 4.890168, title: 'Point 2' };
    rerender(<Map city={mockCity} points={mockPoints} selectedPoint={selectedPoint2} />);

    expect(mockMarkerInstance.setIcon).toHaveBeenCalled();
  });

  it('should clean up markers when component unmounts', () => {
    const { unmount } = render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    unmount();

    expect(mockMapInstance.removeLayer).toHaveBeenCalled();
  });

  it('should create layerGroup and add markers to it', () => {
    render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    expect(mockLayerGroup).toHaveBeenCalled();
    expect(mockLayerGroupInstance.addTo).toHaveBeenCalledWith(mockMapInstance);
    expect(mockMarkerInstance.addTo).toHaveBeenCalled();
  });

  it('should handle empty points array', () => {
    render(<Map city={mockCity} points={[]} selectedPoint={undefined} />);

    expect(mockMarker).not.toHaveBeenCalled();
  });

  it('should not create markers if map is null', () => {
    mockUseMap.mockReturnValue(null);

    render(<Map city={mockCity} points={mockPoints} selectedPoint={undefined} />);

    expect(mockMarker).not.toHaveBeenCalled();
  });
});

