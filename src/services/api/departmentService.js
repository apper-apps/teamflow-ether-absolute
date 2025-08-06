class DepartmentService {
  constructor() {
    this.tableName = 'department';
    this.updateableFields = ['Name', 'Tags', 'managerId'];
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
      console.warn("ApperSDK not available - department service will not function");
    }
  }

_checkClient() {
    if (!this.apperClient) {
      throw new Error("DepartmentService: ApperClient not initialized - check network connection and SDK availability");
    }
  }

async getAll() {
    try {
      this._checkClient();
      const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "managerId" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Map database fields to UI fields
      const departments = (response.data || []).map(dept => ({
        ...dept,
        name: dept.Name // Map database field to UI field
      }));
      
      return departments;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching departments:", error?.response?.data?.message);
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
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "managerId" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Map database fields to UI fields
      const department = {
        ...response.data,
        name: response.data.Name
      };
      
      return department;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching department with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async create(departmentData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields and map UI fields to database fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (field === 'Name' && departmentData.name !== undefined) {
          filteredData.Name = departmentData.name;
        } else if (departmentData[field] !== undefined) {
          filteredData[field] = departmentData[field];
        }
      });
      
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
          console.error(`Failed to create department ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const department = successfulRecords[0].data;
          return {
            ...department,
            name: department.Name
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating department:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async update(id, departmentData) {
    try {
      this._checkClient();
      // Filter to only include updateable fields and map UI fields to database fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (field === 'Name' && departmentData.name !== undefined) {
          filteredData.Name = departmentData.name;
        } else if (departmentData[field] !== undefined) {
          filteredData[field] = departmentData[field];
        }
      });
      
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
          console.error(`Failed to update department ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const department = successfulUpdates[0].data;
          return {
            ...department,
            name: department.Name
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating department:", error?.response?.data?.message);
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
          console.error(`Failed to delete department ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting department records:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
}

export const departmentService = new DepartmentService();