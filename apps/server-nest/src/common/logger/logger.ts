import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class Logger extends ConsoleLogger {
  override error(error: any): void;
  override error(label: string, error?: any): void;
  override error(errorOrLabel: string | any, error?: any) {
    const label = typeof errorOrLabel === 'string' ? errorOrLabel : undefined;
    const stack =
      error && typeof error.stack === 'string' ? error.stack : undefined;

    if (label && stack) {
      return super.error(`${label}: ${stack}`);
    }

    super.error(errorOrLabel || error);
  }
}
