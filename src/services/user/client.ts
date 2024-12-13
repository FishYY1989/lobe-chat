import { DeepPartial } from 'utility-types';

import { FALLBACK_CLIENT_DB_USER_ID, clientDB, getClientDBUserId } from '@/database/client/db';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel } from '@/database/server/models/user';
import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { IUserService } from './type';

export class ClientService implements IUserService {
  private preferenceStorage: AsyncLocalStorage<UserPreference>;
  private readonly fallbackUserId: string;

  private get userId(): string {
    return getClientDBUserId() || this.fallbackUserId;
  }

  private get userModel(): UserModel {
    return new UserModel(clientDB as any, this.userId);
  }
  private get messageModel(): MessageModel {
    return new MessageModel(clientDB as any, this.userId);
  }
  private get sessionModel(): SessionModel {
    return new SessionModel(clientDB as any, this.userId);
  }

  constructor(userId?: string) {
    this.preferenceStorage = new AsyncLocalStorage('LOBE_PREFERENCE');
    this.fallbackUserId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }

  async getUserState(): Promise<UserInitializationState> {
    const state = await this.userModel.getUserState();
    const user = await UserModel.findById(clientDB as any, this.userId);
    const messageCount = await this.messageModel.count();
    const sessionCount = await this.sessionModel.count();

    return {
      ...state,
      avatar: user?.avatar as string,
      canEnablePWAGuide: messageCount >= 4,
      canEnableTrace: messageCount >= 4,
      hasConversation: messageCount > 0 || sessionCount > 0,
      isOnboard: true,
      preference: await this.preferenceStorage.getFromLocalStorage(),
    };
  }

  updateUserSettings = async (patch: DeepPartial<UserSettings>) => {
    return this.userModel.updateSetting(patch as UserSettings);
  };

  resetUserSettings = async () => {
    return this.userModel.deleteSetting();
  };

  updateAvatar(avatar: string) {
    return this.userModel.updateUser({ avatar });
  }

  async updatePreference(preference: Partial<UserPreference>) {
    await this.preferenceStorage.saveToLocalStorage(preference);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
  async updateGuide(guide: Partial<UserGuide>) {
    throw new Error('Method not implemented.');
  }
}
