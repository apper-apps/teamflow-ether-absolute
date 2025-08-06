import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { departmentService } from "@/services/api/departmentService";
import { employeeService } from "@/services/api/employeeService";
import { toast } from "react-toastify";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    managerId: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsData, employeesData] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll()
      ]);
      
      setDepartments(departmentsData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading departments data:", error);
      setError("Failed to load departments");
      setDepartments([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Name.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      setFormLoading(true);
      
      const submitData = {
        Name: formData.Name.trim(),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      if (editingDepartment) {
        await departmentService.update(editingDepartment.Id, submitData);
        toast.success("Department updated successfully");
      } else {
        await departmentService.create(submitData);
        toast.success("Department created successfully");
      }
      
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ Name: "", managerId: "" });
      loadData();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Failed to save department");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      Name: department.Name || "",
      managerId: department.managerId || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (department) => {
    if (!confirm(`Are you sure you want to delete "${department.Name}"?`)) {
      return;
    }

    try {
      await departmentService.delete(department.Id);
      toast.success("Department deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Failed to delete department");
    }
  };

  const getManagerName = (managerId) => {
    const manager = employees.find(emp => emp.Id === managerId);
    return manager ? manager.Name : "No Manager";
  };

  const filteredDepartments = departments.filter(dept =>
    dept.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <Header
        title="Departments"
        subtitle="Manage company departments and their managers"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        <Button
          onClick={() => {
            setEditingDepartment(null);
            setFormData({ Name: "", managerId: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={20} />
          Add Department
        </Button>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <Empty
          message="No departments found"
          description="Create your first department to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <Card key={department.Id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ApperIcon name="Building" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{department.Name}</h3>
                    <p className="text-sm text-gray-600">Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(department)}
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(department)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">{getManagerName(department.managerId)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Employees:</span>
                  <Badge variant="secondary">
                    {employees.filter(emp => emp.department === department.Name).length}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingDepartment ? "Edit Department" : "Add Department"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <Input
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager
                </label>
                <Select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">Select Manager</option>
                  {employees.map((employee) => (
                    <option key={employee.Id} value={employee.Id}>
                      {employee.Name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1"
                >
                  {formLoading ? (
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  ) : editingDepartment ? "Update Department" : "Create Department"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;