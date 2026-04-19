import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/auth.js', async () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  refreshAccessToken: jest.fn(),
}));

const mockGet  = jest.fn();
jest.unstable_mockModule('axios', async () => ({
  default: { get: mockGet, post: jest.fn() },
}));

const { getRecoveries, getLatestRecovery, getSleepCollection, formatRecovery } =
  await import('../../src/api.js');

beforeEach(() => mockGet.mockReset());

describe('getRecoveries', () => {
  test('calls correct endpoint with Bearer token', async () => {
    mockGet.mockResolvedValue({ data: { records: [] } });

    await getRecoveries();

    expect(mockGet).toHaveBeenCalledWith(
      'https://api.prod.whoop.com/developer/v1/recovery',
      expect.objectContaining({ headers: { Authorization: 'Bearer mock-token' } })
    );
  });

  test('passes date range params when provided', async () => {
    mockGet.mockResolvedValue({ data: { records: [] } });

    await getRecoveries({ start: '2026-04-01T00:00:00Z', end: '2026-04-07T00:00:00Z' });

    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ start: '2026-04-01T00:00:00Z' }),
      })
    );
  });
});

describe('getLatestRecovery', () => {
  test('returns first record from collection', async () => {
    const record = { score: { recovery_score: 72 }, created_at: '2026-04-19T06:00:00Z' };
    mockGet.mockResolvedValue({ data: { records: [record] } });

    const result = await getLatestRecovery();
    expect(result).toEqual(record);
  });

  test('returns null if no records', async () => {
    mockGet.mockResolvedValue({ data: { records: [] } });
    const result = await getLatestRecovery();
    expect(result).toBeNull();
  });
});

describe('formatRecovery', () => {
  test('returns "No recovery data found" for null', () => {
    expect(formatRecovery(null)).toBe('No recovery data found.');
  });

  test('formats full recovery record', () => {
    const rec = {
      created_at: '2026-04-19T06:00:00Z',
      score: {
        recovery_score: 82,
        resting_heart_rate: 48,
        hrv_rmssd_milli: 67.3,
        skin_temp_celsius: 33.8,
        spo2_percentage: 98.5,
      },
    };
    const result = formatRecovery(rec);
    expect(result).toContain('82%');
    expect(result).toContain('48 bpm');
    expect(result).toContain('67.3 ms');
    expect(result).toContain('33.8 °C');
    expect(result).toContain('98.5%');
  });

  test('handles missing optional score fields gracefully', () => {
    const rec = { created_at: '2026-04-19T06:00:00Z', score: { recovery_score: 60 } };
    const result = formatRecovery(rec);
    expect(result).toContain('60%');
    expect(result).toContain('N/A');
    expect(result).not.toContain('undefined');
  });
});

describe('getSleepCollection', () => {
  test('calls correct sleep endpoint', async () => {
    mockGet.mockResolvedValue({ data: { records: [] } });
    await getSleepCollection();
    expect(mockGet).toHaveBeenCalledWith(
      'https://api.prod.whoop.com/developer/v1/activity/sleep',
      expect.any(Object)
    );
  });
});
