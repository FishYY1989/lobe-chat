import { FALLBACK_CLIENT_DB_USER_ID, clientDB, getClientDBUserId } from '@/database/client/db';
import { DataImporterRepos } from '@/database/repositories/dataImporter';
import { useUserStore } from '@/store/user';
import { ImportStage, ImporterEntryData, OnImportCallbacks } from '@/types/importer';
import { UserSettings } from '@/types/user/settings';

export class ClientService {
  private readonly fallbackUserId: string;

  private get userId(): string {
    return getClientDBUserId() || this.fallbackUserId;
  }

  private get dataImporter(): DataImporterRepos {
    return new DataImporterRepos(clientDB as any, this.userId);
  }

  constructor(userId?: string) {
    this.fallbackUserId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }

  importSettings = async (settings: UserSettings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData = async (data: ImporterEntryData, callbacks?: OnImportCallbacks) => {
    callbacks?.onStageChange?.(ImportStage.Importing);
    const time = Date.now();
    try {
      const result = await this.dataImporter.importData(data);
      const duration = Date.now() - time;

      callbacks?.onStageChange?.(ImportStage.Success);
      callbacks?.onSuccess?.(result, duration);
    } catch (e) {
      console.error(e);
      callbacks?.onStageChange?.(ImportStage.Error);
      const error = e as Error;

      callbacks?.onError?.({ code: 'ImportError', httpStatus: 0, message: error.message });
    }
  };
}
