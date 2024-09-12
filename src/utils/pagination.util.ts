import { Injectable } from '@nestjs/common';
import { Request } from 'express';

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
    const queryParams = new URLSearchParams(req.query as any);
    queryParams.set('page', String(nextPage));
    queryParams.set('limit', pageSize.toString());

    return `${baseUrl}?${queryParams.toString()}`;
  }
}
