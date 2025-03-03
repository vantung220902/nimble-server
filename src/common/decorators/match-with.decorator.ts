import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export const MatchWith = (
  property: string,
  validationOptions?: ValidationOptions,
) => {
  return function (object: { constructor: any }, propertyName: string) {
    registerDecorator({
      name: 'MatchWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [targetProperty] = args.constraints;
          const targetValue = args.object[`${targetProperty}`];

          return value === targetValue;
        },
        defaultMessage() {
          return `${property} must match with ${propertyName}`;
        },
      },
    });
  };
};
