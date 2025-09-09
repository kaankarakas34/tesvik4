const jwt = require('jsonwebtoken');
const { User, Message } = require('../models');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userRooms = new Map(); // userId -> Set of roomIds
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.fullName} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Socket event handlers
      socket.on('join_chat', (data) => this.handleJoinChat(socket, data));
      socket.on('leave_chat', (data) => this.handleLeaveChat(socket, data));
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      socket.on('mark_read', (data) => this.handleMarkRead(socket, data));
      
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.fullName} disconnected`);
        this.connectedUsers.delete(socket.userId);
        
        // Leave all rooms
        if (this.userRooms.has(socket.userId)) {
          this.userRooms.get(socket.userId).forEach(roomId => {
            socket.leave(roomId);
          });
          this.userRooms.delete(socket.userId);
        }
      });
    });
  }

  async handleJoinChat(socket, data) {
    try {
      const { conversationId } = data;
      const roomId = `chat_${conversationId}`;
      
      // Join the chat room
      socket.join(roomId);
      
      // Track user rooms
      if (!this.userRooms.has(socket.userId)) {
        this.userRooms.set(socket.userId, new Set());
      }
      this.userRooms.get(socket.userId).add(roomId);
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userName: socket.user.fullName,
        timestamp: new Date().toISOString()
      });
      
      console.log(`User ${socket.user.fullName} joined chat ${conversationId}`);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  async handleLeaveChat(socket, data) {
    try {
      const { conversationId } = data;
      const roomId = `chat_${conversationId}`;
      
      socket.leave(roomId);
      
      if (this.userRooms.has(socket.userId)) {
        this.userRooms.get(socket.userId).delete(roomId);
      }
      
      // Notify others in the room
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.fullName,
        timestamp: new Date().toISOString()
      });
      
      console.log(`User ${socket.user.fullName} left chat ${conversationId}`);
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { conversationId, content, messageType = 'text' } = data;
      
      // Validate token freshness before sending message
      const tokenValid = await this.validateTokenFreshness(socket);
      if (!tokenValid) {
        socket.emit('token_expired', { message: 'Token expired, please refresh' });
        return;
      }
      
      // Determine sender type based on user role
      let senderType = 'user';
      if (socket.user.role === 'consultant') {
        senderType = 'consultant';
      } else if (socket.user.role === 'admin') {
        senderType = 'system';
      }
      
      // Save message to database
      const message = await Message.create({
        conversationId,
        conversationType: 'application',
        senderId: socket.userId,
        senderType,
        content,
        messageType,
        isRead: false
      });
      
      // Include sender info
      const messageWithSender = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderType: message.senderType,
        content: message.content,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
        sender: {
          id: socket.user.id,
          fullName: socket.user.fullName,
          role: socket.user.role
        }
      };
      
      const roomId = `chat_${conversationId}`;
      
      // Send to all users in the chat room
      this.io.to(roomId).emit('new_message', messageWithSender);
      
      // Send to admin users for monitoring
      this.io.to('admin_room').emit('admin_message_notification', {
        conversationId,
        message: messageWithSender,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Message sent in chat ${conversationId} by ${socket.user.fullName}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  async handleTypingStart(socket, data) {
    const { conversationId } = data;
    const roomId = `chat_${conversationId}`;
    
    socket.to(roomId).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping: true
    });
  }

  async handleTypingStop(socket, data) {
    const { conversationId } = data;
    const roomId = `chat_${conversationId}`;
    
    socket.to(roomId).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping: false
    });
  }

  async handleMarkRead(socket, data) {
    try {
      const { messageIds } = data;
      
      await Message.update(
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { 
          where: { 
            id: messageIds,
            senderId: { [require('sequelize').Op.ne]: socket.userId }
          } 
        }
      );
      
      socket.emit('messages_marked_read', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async validateTokenFreshness(socket) {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is about to expire (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Admin methods
  joinAdminRoom(socket) {
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
      console.log(`Admin ${socket.user.fullName} joined admin monitoring room`);
    }
  }

  // Get online users in a chat
  getOnlineUsersInChat(conversationId) {
    const roomId = `chat_${conversationId}`;
    const room = this.io.sockets.adapter.rooms.get(roomId);
    
    if (!room) return [];
    
    const onlineUsers = [];
    room.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.user) {
        onlineUsers.push({
          id: socket.user.id,
          fullName: socket.user.fullName,
          role: socket.user.role
        });
      }
    });
    
    return onlineUsers;
  }
}

module.exports = SocketService;