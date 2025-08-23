import { describe, it, expect } from 'vitest';
import { normalizeDashes, normalizeArgsArray } from './dash-normalizer';

describe('Dash Normalizer', () => {
  describe('normalizeDashes', () => {
    it('should convert em dash to double dash for long flags', () => {
      expect(normalizeDashes('—model')).toBe('--model');
      expect(normalizeDashes('—verbose')).toBe('--verbose');
      expect(normalizeDashes('—provider')).toBe('--provider');
    });

    it('should convert en dash to double dash for long flags', () => {
      expect(normalizeDashes('–model')).toBe('--model');
      expect(normalizeDashes('–verbose')).toBe('--verbose');
      expect(normalizeDashes('–provider')).toBe('--provider');
    });

    it('should convert single Unicode dash to single dash for short flags', () => {
      expect(normalizeDashes('—m')).toBe('-m');
      expect(normalizeDashes('—v')).toBe('-v');
      expect(normalizeDashes('—p')).toBe('-p');
      expect(normalizeDashes('—t')).toBe('-t');
      expect(normalizeDashes('–m')).toBe('-m');
      expect(normalizeDashes('–v')).toBe('-v');
    });

    it('should leave regular dashes unchanged', () => {
      expect(normalizeDashes('--model')).toBe('--model');
      expect(normalizeDashes('-m')).toBe('-m');
      expect(normalizeDashes('regular-text')).toBe('regular-text');
      expect(normalizeDashes('some-file-name.txt')).toBe('some-file-name.txt');
    });

    it('should handle strings without dashes', () => {
      expect(normalizeDashes('model')).toBe('model');
      expect(normalizeDashes('gpt4')).toBe('gpt4');
      expect(normalizeDashes('')).toBe('');
    });

    it('should handle multiple Unicode dashes in one string', () => {
      expect(normalizeDashes('—model —value')).toBe('--model --value');
      expect(normalizeDashes('–task –verbose')).toBe('--task --verbose');
      expect(normalizeDashes('—mixed–dashes')).toBe('--mixed--dashes');
    });
  });

  describe('normalizeArgsArray', () => {
    it('should normalize all arguments in array', async () => {
      const input = ['—model', 'gpt-4', '—provider', 'openai', '—verbose'];
      const expected = ['--model', 'gpt-4', '--provider', 'openai', '--verbose'];
      expect(normalizeArgsArray(input)).toEqual(expected);
    });

    it('should handle mixed dash types in array', async () => {
      const input = ['—model', 'gpt-4', '--provider', 'openai', '–verbose'];
      const expected = ['--model', 'gpt-4', '--provider', 'openai', '--verbose'];
      expect(normalizeArgsArray(input)).toEqual(expected);
    });

    it('should handle short flags correctly', async () => {
      const input = ['—m', 'gpt-4', '—v'];
      const expected = ['-m', 'gpt-4', '-v'];
      expect(normalizeArgsArray(input)).toEqual(expected);
    });

    it('should handle empty array', async () => {
      expect(normalizeArgsArray([])).toEqual([]);
    });

    it('should handle array with non-dash arguments', async () => {
      const input = ['regular', 'arguments', 'without', 'dashes'];
      const expected = ['regular', 'arguments', 'without', 'dashes'];
      expect(normalizeArgsArray(input)).toEqual(expected);
    });

    it('should preserve order and structure', async () => {
      const input = ['—model', 'gpt-4', 'normal-arg', '–verbose', 'another'];
      const expected = ['--model', 'gpt-4', 'normal-arg', '--verbose', 'another'];
      expect(normalizeArgsArray(input)).toEqual(expected);
    });
  });
});