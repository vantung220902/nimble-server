import { SwaggerConfigOptions } from '@swagger';

describe('SwaggerConfigOptions', () => {
  it('Should initialize SwaggerConfigOptions correctly', () => {
    const configOptions: SwaggerConfigOptions = {
      disabled: true,
    };

    expect(configOptions.disabled).toEqual(true);
  });
});
