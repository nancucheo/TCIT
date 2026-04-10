import { describe, it, expect } from 'vitest';
import { useAppDispatch, useAppSelector } from './hooks';

describe('hooks', () => {
  it('should export useAppDispatch', () => {
    expect(useAppDispatch).toBeDefined();
    expect(typeof useAppDispatch).toBe('function');
  });

  it('should export useAppSelector', () => {
    expect(useAppSelector).toBeDefined();
    expect(typeof useAppSelector).toBe('function');
  });
});
