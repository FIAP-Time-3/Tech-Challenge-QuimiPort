import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isPublic } from './setPublic.decorator.js';

describe('isPublic', () => {
  const handler = {};
  const controller = {};

  function context(): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
    } as unknown as ExecutionContext;
  }

  it('retorna false quando handler e controller são privados', () => {
    const reflector = {
      get: vi.fn().mockReturnValue(false),
    } as unknown as Reflector;

    expect(isPublic({ reflector, context: context() })).toBe(false);
    expect(reflector.get).toHaveBeenCalledTimes(2);
  });

  it('retorna true para rota pública no handler', () => {
    const reflector = {
      get: vi.fn((_key: string, target: object) => target === handler),
    } as unknown as Reflector;

    expect(isPublic({ reflector, context: context() })).toBe(true);
  });

  it('retorna true para controller público', () => {
    const reflector = {
      get: vi.fn((_key: string, target: object) => target === controller),
    } as unknown as Reflector;

    expect(isPublic({ reflector, context: context() })).toBe(true);
  });
});
