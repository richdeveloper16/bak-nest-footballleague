import { Injectable, Logger } from '@nestjs/common';
import { formatApiTimestamp } from '../../common/utils/date-time.util';

@Injectable()
export class InitService {
  private readonly logger = new Logger(InitService.name);

  getInit(): string {
    const message = `API iniciada de forma correcta ${formatApiTimestamp()}`;

    return message;
  }
}
