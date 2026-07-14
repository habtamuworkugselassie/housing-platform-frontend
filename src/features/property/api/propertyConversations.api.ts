import api from '@/shared/api/client'

export interface PropertyConversation {
  id: string
  propertyId: string
  propertyTitle: string
  buyerUserId: string
  buyerName: string
  agentId: string
  agentUserId: string
  agentName: string
  createdAt: string
  updatedAt: string
}

export interface PropertyConversationMessage {
  id: string
  conversationId: string
  senderUserId: string
  senderName: string
  message: string
  readAt: string | null
  createdAt: string
}

export const propertyConversationsApi = {
  async getConversations(): Promise<PropertyConversation[]> {
    const response = await api.get<PropertyConversation[]>('/property-conversations')
    return response.data
  },

  async getMessages(conversationId: string): Promise<PropertyConversationMessage[]> {
    const response = await api.get<PropertyConversationMessage[]>(
      `/property-conversations/${conversationId}/messages`
    )
    return response.data
  },

  async sendMessage(
    conversationId: string,
    message: string
  ): Promise<PropertyConversationMessage> {
    const response = await api.post<PropertyConversationMessage>(
      `/property-conversations/${conversationId}/messages`,
      { message }
    )
    return response.data
  }
}
