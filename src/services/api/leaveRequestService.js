class LeaveRequestService {
  constructor() {
    this.tableName = 'leave_request';
    this.updateableFields = ['startDate', 'Name', 'Tags', 'type', 'endDate', 'reason', 'status', 'requestDate', 'employeeId'];
    this.apperClient = null;
    
    // Initialize ApperClient if SDK is available
    if (window.ApperSDK && window.ApperSDK.ApperClient) {
      try {
        const { ApperClient } = window.ApperSDK;
        this.apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
      } catch (error) {
        console.error("Failed to initialize ApperClient:", error);
      }
    } else {
      console.warn("ApperSDK not available - leave request service will not function");
    }
  }

  _checkClient() {
    if (!this.apperClient) {
      throw new Error("ApperClient not initialized - check network connection and SDK availability");
    }
  }

async getAll() {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "startDate" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "endDate" } },
          { field: { Name: "reason" } },
          { field: { Name: "status" } },
          { field: { Name: "requestDate" } },
          { field: { Name: "employeeId" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leave requests:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async getById(id) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "startDate" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "endDate" } },
          { field: { Name: "reason" } },
          { field: { Name: "status" } },
          { field: { Name: "requestDate" } },
          { field: { Name: "employeeId" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching leave request with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async create(requestData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (requestData[field] !== undefined) {
          filteredData[field] = requestData[field];
        }
      });
      
      // Convert lookup field to integer
      if (filteredData.employeeId) {
        filteredData.employeeId = parseInt(filteredData.employeeId);
      }
      
      // Set default request date if not provided
      if (!filteredData.requestDate) {
        filteredData.requestDate = new Date().toISOString().split("T")[0];
      }
      
      const params = {
        records: [filteredData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create leave request ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating leave request:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async update(id, requestData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (requestData[field] !== undefined) {
          filteredData[field] = requestData[field];
        }
      });
      
      // Convert lookup field to integer
      if (filteredData.employeeId) {
        filteredData.employeeId = parseInt(filteredData.employeeId);
      }
      
      const params = {
        records: [filteredData]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update leave request ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating leave request:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async delete(id) {
    try {
      this._checkClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete leave request ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting leave request records:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async getByEmployeeId(employeeId) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "startDate" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "endDate" } },
          { field: { Name: "reason" } },
          { field: { Name: "status" } },
          { field: { Name: "requestDate" } },
          { field: { Name: "employeeId" } }
        ],
        where: [
          {
            FieldName: "employeeId",
            Operator: "EqualTo",
            Values: [parseInt(employeeId)],
            Include: true
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leave requests by employee ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async getByStatus(status) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "startDate" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type" } },
          { field: { Name: "endDate" } },
          { field: { Name: "reason" } },
          { field: { Name: "status" } },
          { field: { Name: "requestDate" } },
          { field: { Name: "employeeId" } }
        ],
        where: [
          {
            FieldName: "status",
            Operator: "EqualTo",
            Values: [status],
            Include: true
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leave requests by status:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async getPendingRequests() {
    return await this.getByStatus('pending');
  }
}

export const leaveRequestService = new LeaveRequestService();