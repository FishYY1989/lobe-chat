import { FALLBACK_CLIENT_DB_USER_ID, getClientDBUserId } from '@/database/client/db';

export class BaseClientService {
  private readonly fallbackUserId: string;

  protected get userId(): string {
    return getClientDBUserId() || this.fallbackUserId;
  }

  constructor(userId?: string) {
    this.fallbackUserId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }
}
