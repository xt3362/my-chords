import '@testing-library/jest-dom';
import { vi } from 'vitest';

// AudioContextのモック
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: class MockAudioContext {
    createOscillator() {
      return {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: 'sine',
      };
    }
    createGain() {
      return {
        connect: vi.fn(),
        gain: { value: 1 },
      };
    }
    get destination() {
      return {};
    }
    get currentTime() {
      return 0;
    }
  },
});

// webkitAudioContextのモック
Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: window.AudioContext,
});