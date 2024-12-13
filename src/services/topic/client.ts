import { FALLBACK_CLIENT_DB_USER_ID, clientDB, getClientDBUserId } from '@/database/client/db';
import { TopicModel } from '@/database/server/models/topic';
import { ChatTopic } from '@/types/topic';

import { CreateTopicParams, ITopicService, QueryTopicParams } from './type';

export class ClientService implements ITopicService {
  private readonly fallbackUserId: string;

  private get userId(): string {
    return getClientDBUserId() || this.fallbackUserId;
  }

  private get topicModel(): TopicModel {
    return new TopicModel(clientDB as any, this.userId);
  }

  constructor(userId?: string) {
    this.fallbackUserId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }

  async createTopic(params: CreateTopicParams): Promise<string> {
    const item = await this.topicModel.create(params as any);

    if (!item) {
      throw new Error('topic create Error');
    }

    return item.id;
  }

  async batchCreateTopics(importTopics: ChatTopic[]) {
    const data = await this.topicModel.batchCreate(importTopics as any);

    return { added: data.length, ids: [], skips: [], success: true };
  }

  async cloneTopic(id: string, newTitle?: string) {
    const data = await this.topicModel.duplicate(id, newTitle);
    return data.topic.id;
  }

  async getTopics(params: QueryTopicParams) {
    const data = await this.topicModel.query(params);
    return data as unknown as Promise<ChatTopic[]>;
  }

  async searchTopics(keyword: string, sessionId?: string) {
    const data = await this.topicModel.queryByKeyword(keyword, sessionId);

    return data as unknown as Promise<ChatTopic[]>;
  }

  async getAllTopics() {
    const data = await this.topicModel.queryAll();

    return data as unknown as Promise<ChatTopic[]>;
  }

  async countTopics() {
    return this.topicModel.count();
  }

  async updateTopic(id: string, data: Partial<ChatTopic>) {
    return this.topicModel.update(id, data as any);
  }

  async removeTopic(id: string) {
    return this.topicModel.delete(id);
  }

  async removeTopics(sessionId: string) {
    return this.topicModel.batchDeleteBySessionId(sessionId);
  }

  async batchRemoveTopics(topics: string[]) {
    return this.topicModel.batchDelete(topics);
  }

  async removeAllTopic() {
    return this.topicModel.deleteAll();
  }
}
