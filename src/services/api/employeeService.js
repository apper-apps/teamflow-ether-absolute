import employeesData from "@/services/mockData/employees.json";

class EmployeeService {
  constructor() {
    this.employees = [...employeesData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.employees];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const employee = this.employees.find(emp => emp.Id === parseInt(id));
    if (!employee) {
      throw new Error("Employee not found");
    }
    return { ...employee };
  }

  async create(employeeData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.employees.map(emp => emp.Id), 0);
    const newEmployee = {
      ...employeeData,
      Id: maxId + 1,
      joinDate: new Date().toISOString().split("T")[0]
    };
    
    this.employees.push(newEmployee);
    return { ...newEmployee };
  }

  async update(id, employeeData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.employees.findIndex(emp => emp.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Employee not found");
    }
    
    this.employees[index] = { ...this.employees[index], ...employeeData };
    return { ...this.employees[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.employees.findIndex(emp => emp.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Employee not found");
    }
    
    this.employees.splice(index, 1);
    return true;
  }
}

export const employeeService = new EmployeeService();