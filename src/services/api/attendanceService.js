class AttendanceService {
  constructor() {
    this.tableName = 'attendance';
    this.updateableFields = ['Name', 'Tags', 'date', 'checkIn', 'checkOut', 'status', 'employeeId'];
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
      console.warn("ApperSDK not available - attendance service will not function");
    }
  }

_checkClient() {
    if (!this.apperClient) {
      throw new Error("AttendanceService not available - connection to backend service failed. Please check your internet connection and try again.");
    }
  }

async getAll() {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "date" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "status" } },
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
        console.error("Error fetching attendance records:", error?.response?.data?.message);
        throw new Error(`Failed to load attendance data: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        console.error("Attendance service unavailable:", error.message);
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        console.error("Network error loading attendance:", error.message);
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      } else {
        console.error("Unexpected error in attendance service:", error.message);
        throw new Error("Unable to load attendance data. Please try again later.");
      }
    }
  }

async getById(id) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "date" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "status" } },
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
        console.error(`Error fetching attendance record with ID ${id}:`, error?.response?.data?.message);
        throw new Error(`Failed to load attendance record: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      } else {
        console.error("Unexpected error fetching attendance record:", error.message);
        throw new Error("Unable to load attendance record. Please try again later.");
      }
    }
  }

async create(attendanceData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (attendanceData[field] !== undefined) {
          filteredData[field] = attendanceData[field];
        }
      });
      
      // Convert lookup field to integer
      if (filteredData.employeeId) {
        filteredData.employeeId = parseInt(filteredData.employeeId);
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
          console.error(`Failed to create attendance ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating attendance record:", error?.response?.data?.message);
        throw new Error(`Failed to create attendance record: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Unable to save attendance record. Please try again.");
      } else {
        console.error("Unexpected error creating attendance record:", error.message);
        throw new Error("Unable to save attendance record. Please try again later.");
      }
    }
  }

async update(id, attendanceData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (attendanceData[field] !== undefined) {
          filteredData[field] = attendanceData[field];
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
          console.error(`Failed to update attendance ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating attendance record:", error?.response?.data?.message);
        throw new Error(`Failed to update attendance record: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Unable to update attendance record. Please try again.");
      } else {
        console.error("Unexpected error updating attendance record:", error.message);
        throw new Error("Unable to update attendance record. Please try again later.");
      }
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
          console.error(`Failed to delete attendance ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting attendance records:", error?.response?.data?.message);
        throw new Error(`Failed to delete attendance record: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Unable to delete attendance record. Please try again.");
      } else {
        console.error("Unexpected error deleting attendance record:", error.message);
        throw new Error("Unable to delete attendance record. Please try again later.");
      }
    }
  }

async getByEmployeeId(employeeId) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "date" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "status" } },
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
        console.error("Error fetching attendance by employee ID:", error?.response?.data?.message);
        throw new Error(`Failed to load employee attendance: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Unable to load employee attendance. Please try again.");
      } else {
        console.error("Unexpected error fetching attendance by employee:", error.message);
        throw new Error("Unable to load employee attendance. Please try again later.");
      }
    }
  }

async getByDate(date) {
    try {
      this._checkClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "date" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "status" } },
          { field: { Name: "employeeId" } }
        ],
        where: [
          {
            FieldName: "date",
            Operator: "EqualTo",
            Values: [date],
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
        console.error("Error fetching attendance by date:", error?.response?.data?.message);
        throw new Error(`Failed to load attendance for date: ${error.response.data.message}`);
      } else if (error.message.includes('not available')) {
        throw error; // Pass through service availability errors
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        throw new Error("Network connection failed. Unable to load attendance data. Please try again.");
      } else {
        console.error("Unexpected error fetching attendance by date:", error.message);
        throw new Error("Unable to load attendance data. Please try again later.");
      }
    }
  }
}

export const attendanceService = new AttendanceService();