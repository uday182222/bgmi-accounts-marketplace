import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

// Mock message data - in real app, this would come from database
const conversations: any[] = [];
const messages: any[] = [];

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const userConversations = conversations.filter(conv => 
      conv.participant1Id === userId || conv.participant2Id === userId
    );

    res.json({
      success: true,
      data: { conversations: userConversations }
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const conversation = conversations.find(conv => conv.id === id);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if user is participant
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new AppError('Not authorized to view this conversation', 403);
    }

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.query;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get conversation messages
    const conversationMessages = messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        messages: conversationMessages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: messages.filter(msg => msg.conversationId === conversationId).length,
          pages: Math.ceil(messages.filter(msg => msg.conversationId === conversationId).length / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { receiverId, content, conversationId } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      throw new AppError('User not authenticated', 401);
    }

    let convId = conversationId;

    // If no conversation ID provided, find or create conversation
    if (!convId) {
      let conversation = conversations.find(conv =>
        (conv.participant1Id === senderId && conv.participant2Id === receiverId) ||
        (conv.participant1Id === receiverId && conv.participant2Id === senderId)
      );

      if (!conversation) {
        conversation = {
          id: `conv_${Date.now()}`,
          participant1Id: senderId,
          participant2Id: receiverId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        conversations.push(conversation);
      }

      convId = conversation.id;
    }

    // Create message
    const message = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt: new Date()
    };

    messages.push(message);

    // Emit to Socket.IO
    const io = req.app.get('io');
    io.to(convId).emit('receive_message', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messageIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Mark messages as read
    messageIds.forEach((messageId: string) => {
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1 && messages[messageIndex].receiverId === userId) {
        messages[messageIndex].isRead = true;
        messages[messageIndex].readAt = new Date();
      }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      throw new AppError('Message not found', 404);
    }

    // Check if user is the sender
    if (messages[messageIndex].senderId !== userId) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    // Delete message
    messages.splice(messageIndex, 1);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
