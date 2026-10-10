import { MOCK_BUSES, MOCK_STOPS, MOCK_TRIP_STATS } from '../mockData';

describe('Datos simulados', () => {
  test('MOCK_BUSES tiene al menos 3 elementos', () => {
    expect(MOCK_BUSES.length).toBeGreaterThanOrEqual(3);
  });

  test('cada bus tiene los campos requeridos', () => {
    MOCK_BUSES.forEach((bus) => {
      expect(bus).toHaveProperty('id');
      expect(bus).toHaveProperty('driverName');
      expect(bus).toHaveProperty('latitude');
      expect(bus).toHaveProperty('longitude');
      expect(bus).toHaveProperty('speed');
      expect(bus).toHaveProperty('isActive');
    });
  });

  test('MOCK_STOPS tiene al menos una parada', () => {
    expect(MOCK_STOPS.length).toBeGreaterThan(0);
  });

  test('MOCK_TRIP_STATS tiene pasajeros dentro del máximo', () => {
    expect(MOCK_TRIP_STATS.passengers).toBeLessThanOrEqual(MOCK_TRIP_STATS.maxPassengers);
  });
});