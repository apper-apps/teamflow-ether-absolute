import leaveRequestsData from "@/services/mockData/leaveRequests.json";

class LeaveRequestService {
  constructor() {
    this.leaveRequests = [...leaveRequestsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.leaveRequests];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const request = this.leaveRequests.find(req => req.Id === parseInt(id));
    if (!request) {
      throw new Error("Leave request not found");
    }
    return { ...request };
  }

  async create(requestData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.leaveRequests.map(req => req.Id), 0);
    const newRequest = {
      ...requestData,
      Id: maxId + 1,
      requestDate: requestData.requestDate || new Date().toISOString().split("T")[0]
    };
    
    this.leaveRequests.push(newRequest);
    return { ...newRequest };
  }

  async update(id, requestData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.leaveRequests.findIndex(req => req.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Leave request not found");
    }
    
    this.leaveRequests[index] = { ...this.leaveRequests[index], ...requestData };
    return { ...this.leaveRequests[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.leaveRequests.findIndex(req => req.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Leave request not found");
    }
    
    this.leaveRequests.splice(index, 1);
    return true;
  }

  async getByEmployeeId(employeeId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.leaveRequests.filter(req => req.employeeId === parseInt(employeeId));
  }

  async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.leaveRequests.filter(req => req.status === status);
  }
}

export const leaveRequestService = new LeaveRequestService();