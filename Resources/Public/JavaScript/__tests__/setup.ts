import { jest } from '@jest/globals';

// Mock global fetch for all tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>; 