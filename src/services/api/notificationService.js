class NotificationService {
  constructor() {
    this.notifications = [
      {
        Id: 1,
        type: 'leave_approval_needed',
        title: 'Leave Request Needs Approval',
        message: 'Michael Johnson has requested vacation leave for March 10-17',
        data: { leaveRequestId: 4, employeeId: 7 },
        isRead: false,
        createdAt: '2024-01-28T10:30:00Z',
        priority: 'high'
      },
      {
        Id: 2,
        type: 'leave_approval_needed',
        title: 'Leave Request Needs Approval',
        message: 'David Wilson has requested personal leave for February 5-6',
        data: { leaveRequestId: 6, employeeId: 9 },
        isRead: false,
        createdAt: '2024-01-30T14:15:00Z',
        priority: 'high'
      },
      {
        Id: 3,
        type: 'leave_approval_needed',
        title: 'Leave Request Needs Approval',
        message: 'Robert Davis has requested sick leave for January 29-30',
        data: { leaveRequestId: 8, employeeId: 8 },
        isRead: true,
        createdAt: '2024-01-28T16:45:00Z',
        priority: 'high'
      },
      {
        Id: 4,
        type: 'leave_status_update',
        title: 'Leave Request Approved',
        message: 'Your vacation request for February 15-19 has been approved',
        data: { leaveRequestId: 1, employeeId: 1 },
        isRead: false,
        createdAt: '2024-01-22T09:00:00Z',
        priority: 'medium'
      },
      {
        Id: 5,
        type: 'leave_status_update',
        title: 'Leave Request Rejected',
        message: 'Your vacation request for April 1-5 has been rejected',
        data: { leaveRequestId: 7, employeeId: 4 },
        isRead: false,
        createdAt: '2024-01-16T11:30:00Z',
        priority: 'medium'
      }
    ];
    this.nextId = 6;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    // Return a copy to prevent direct mutation
    return this.notifications.map(notification => ({ ...notification }));
  }

  async getUnread() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.notifications
      .filter(notification => !notification.isRead)
      .map(notification => ({ ...notification }));
  }

  async getById(id) {
    if (typeof id !== 'number') {
      throw new Error('ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    const notification = this.notifications.find(n => n.Id === id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return { ...notification };
  }

  async create(notificationData) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newNotification = {
      Id: this.nextId++,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: notificationData.priority || 'medium'
    };
    
    this.notifications.unshift(newNotification);
    return { ...newNotification };
  }

  async markAsRead(id) {
    if (typeof id !== 'number') {
      throw new Error('ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    const notification = this.notifications.find(n => n.Id === id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.isRead = true;
    return { ...notification };
  }

  async markAllAsRead() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    return this.notifications.map(notification => ({ ...notification }));
  }

  async delete(id) {
    if (typeof id !== 'number') {
      throw new Error('ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = this.notifications.findIndex(n => n.Id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    const deletedNotification = this.notifications.splice(index, 1)[0];
    return { ...deletedNotification };
  }

  async generateLeaveApprovalNotification(leaveRequest, employee) {
    const notification = {
      type: 'leave_approval_needed',
      title: 'Leave Request Needs Approval',
      message: `${employee.name} has requested ${leaveRequest.type} leave for ${leaveRequest.startDate} to ${leaveRequest.endDate}`,
      data: { 
        leaveRequestId: leaveRequest.Id, 
        employeeId: leaveRequest.employeeId 
      },
      priority: 'high'
    };
    
    return await this.create(notification);
  }

  async generateLeaveStatusNotification(leaveRequest, employee, status) {
    const statusMessages = {
      approved: 'has been approved',
      rejected: 'has been rejected'
    };
    
    const notification = {
      type: 'leave_status_update',
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leaveRequest.type} request for ${leaveRequest.startDate} to ${leaveRequest.endDate} ${statusMessages[status]}`,
      data: { 
        leaveRequestId: leaveRequest.Id, 
        employeeId: leaveRequest.employeeId 
      },
      priority: 'medium'
    };
    
    return await this.create(notification);
  }

  async getByType(type) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.notifications
      .filter(notification => notification.type === type)
      .map(notification => ({ ...notification }));
  }
}

export const notificationService = new NotificationService();