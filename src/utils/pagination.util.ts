import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as qs from 'qs';

@Injectable()
export class UrlGeneratorService {
  generateNextPageUrl(
    nextPage: number | null,
    pageSize: number,
    req: Request,
  ): string | null {
    if (nextPage === null || nextPage === undefined) return null;

    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;

    // Append pagination parameters to the existing query string
    const queryParams = qs.stringify({
      ...req.query,
      page: nextPage,
      limit: pageSize,
    });

    return `${baseUrl}?${queryParams}`;
  }
}
