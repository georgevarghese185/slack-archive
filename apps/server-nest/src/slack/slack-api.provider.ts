import { Injectable } from '@nestjs/common';
import {
  SlackApiRequests,
  SlackApiResponse,
  SlackApiResponses,
} from './slack.types';

@Injectable()
export class SlackApiProvider {
  async request<E extends keyof SlackApiRequests & keyof SlackApiResponses>(
    _endpoint: E,
    _request: SlackApiRequests[E],
  ): Promise<SlackApiResponse<SlackApiResponses[E]>> {
    throw new Error('Not Implemented');
  }
}
