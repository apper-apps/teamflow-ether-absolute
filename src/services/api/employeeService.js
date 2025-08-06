class EmployeeService {
  constructor() {
    this.tableName = 'employee';
    this.updateableFields = ['Name', 'Tags', 'email', 'role', 'department', 'joinDate', 'phone', 'photoUrl', 'status', 'emergencyContacts'];
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
      console.warn("ApperSDK not available - employee service will not function");
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
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email" } },
          { field: { Name: "role" } },
          { field: { Name: "department" } },
          { field: { Name: "joinDate" } },
          { field: { Name: "phone" } },
          { field: { Name: "photoUrl" } },
          { field: { Name: "status" } },
          { field: { Name: "emergencyContacts" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Parse emergency contacts from JSON string
      const employees = (response.data || []).map(employee => ({
        ...employee,
        name: employee.Name, // Map database field to UI field
        emergencyContacts: employee.emergencyContacts ? 
          (typeof employee.emergencyContacts === 'string' ? 
            JSON.parse(employee.emergencyContacts) : 
            employee.emergencyContacts) : []
      }));
      
      return employees;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching employees:", error?.response?.data?.message);
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
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email" } },
          { field: { Name: "role" } },
          { field: { Name: "department" } },
          { field: { Name: "joinDate" } },
          { field: { Name: "phone" } },
          { field: { Name: "photoUrl" } },
          { field: { Name: "status" } },
          { field: { Name: "emergencyContacts" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Parse emergency contacts and map fields
      const employee = {
        ...response.data,
        name: response.data.Name,
        emergencyContacts: response.data.emergencyContacts ? 
          (typeof response.data.emergencyContacts === 'string' ? 
            JSON.parse(response.data.emergencyContacts) : 
            response.data.emergencyContacts) : []
      };
      
      return employee;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching employee with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async create(employeeData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields and map UI fields to database fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (field === 'Name' && employeeData.name !== undefined) {
          filteredData.Name = employeeData.name;
        } else if (employeeData[field] !== undefined) {
          filteredData[field] = employeeData[field];
        }
      });
      
      // Convert emergency contacts to JSON string
      if (filteredData.emergencyContacts) {
        filteredData.emergencyContacts = JSON.stringify(filteredData.emergencyContacts);
      }
      
      // Set default join date if not provided
      if (!filteredData.joinDate) {
        filteredData.joinDate = new Date().toISOString().split("T")[0];
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
          console.error(`Failed to create employee ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const employee = successfulRecords[0].data;
          return {
            ...employee,
            name: employee.Name,
            emergencyContacts: employee.emergencyContacts ? 
              JSON.parse(employee.emergencyContacts) : []
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating employee:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async update(id, employeeData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields and map UI fields to database fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (field === 'Name' && employeeData.name !== undefined) {
          filteredData.Name = employeeData.name;
        } else if (employeeData[field] !== undefined) {
          filteredData[field] = employeeData[field];
        }
      });
      
      // Convert emergency contacts to JSON string
      if (filteredData.emergencyContacts) {
        filteredData.emergencyContacts = JSON.stringify(filteredData.emergencyContacts);
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
          console.error(`Failed to update employee ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const employee = successfulUpdates[0].data;
          return {
            ...employee,
            name: employee.Name,
            emergencyContacts: employee.emergencyContacts ? 
              JSON.parse(employee.emergencyContacts) : []
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating employee:", error?.response?.data?.message);
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
          console.error(`Failed to delete employee ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting employee records:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();