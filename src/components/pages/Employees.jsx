import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { employeeService } from "@/services/api/employeeService";
import { departmentService } from "@/services/api/departmentService";
import EmployeeCard from "@/components/molecules/EmployeeCard";
import Header from "@/components/organisms/Header";
import EmployeeModal from "@/components/organisms/EmployeeModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employeesData, departmentsData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll()
      ]);
      
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setFilteredEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

useEffect(() => {
    let filtered = employees;
    
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        (emp.name || emp.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, selectedDepartment]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
if (window.confirm(`Are you sure you want to delete ${employee.name || employee.Name}?`)) {
      try {
        await employeeService.delete(employee.Id);
        toast.success("Employee deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete employee");
      }
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (selectedEmployee) {
        await employeeService.update(selectedEmployee.Id, employeeData);
        toast.success("Employee updated successfully");
      } else {
        await employeeService.create(employeeData);
        toast.success("Employee added successfully");
      }
      loadData();
    } catch (error) {
      toast.error("Failed to save employee");
      throw error;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  if (loading) return <Loading variant="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      <Header 
        title="Employees" 
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        actions={
          <>
            <div className="w-48">
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                placeholder="All Departments"
              >
                <option value="">All Departments</option>
{departments.map(dept => (
                  <option key={dept.Id} value={dept.name || dept.Name}>
                    {dept.name || dept.Name}
                  </option>
                ))}
              </Select>
            </div>
            <Button icon="Plus" onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </>
        }
      />

      {filteredEmployees.length === 0 ? (
        <Empty
          title="No employees found"
          description="Start building your team by adding your first employee"
          action={handleAddEmployee}
          actionLabel="Add Employee"
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.Id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>
      )}

<EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
        departments={departments}
        onDepartmentRefresh={loadData}
      />
    </div>
  );
};

export default Employees;