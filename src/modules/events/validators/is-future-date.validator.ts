import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const eventDate = new Date(value);

          if (isNaN(eventDate.getTime())) {
            return false;
          }

          return eventDate >= new Date();
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} не может быть в прошлом`;
        },
      },
    });
  };
}