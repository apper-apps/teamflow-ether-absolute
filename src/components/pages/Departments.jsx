import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { employeeService } from "@/services/api/employeeService";
import { departmentService } from "@/services/api/departmentService";
import ApperIcon from "@/components/ApperIcon";
import Header from "@/components/organisms/Header";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  const [filterManager, setFilterManager] = useState("");
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

const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManager = !filterManager || dept.managerId === parseInt(filterManager);
    return matchesSearch && matchesManager;
  });

if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <Button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Department
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="w-48"
            >
              <option value="">All Managers</option>
              {employees.map(emp => (
                <option key={emp.Id} value={emp.Id}>{emp.Name || emp.name}</option>
              ))}
            </Select>
          </div>

          {/* Departments Grid */}
          {filteredDepartments.length === 0 ? (
            <Empty 
              title="No departments found"
              description={searchTerm || filterManager ? "No departments match your search criteria" : "Get started by creating your first department"}
              action={
                <Button onClick={() => setShowModal(true)}>
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Department
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <Card key={department.Id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {department.name || department.Name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <ApperIcon name="User" size={14} />
                          <span>Manager: {getManagerName(department.managerId) || 'Not assigned'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <ApperIcon name="Edit2" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(department)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>

                  {department.Tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {department.Tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Department ID: {department.Id}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Name
                      </label>
                      <Input
                        type="text"
value={formData.Name}
                        onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
                        required
                        placeholder="Enter department name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager
                      </label>
                      <Select
                        value={formData.managerId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                      >
                        <option value="">Select a manager</option>
                        {employees.map(emp => (
                          <option key={emp.Id} value={emp.Id}>
                            {emp.Name || emp.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <Input
                        type="text"
                        value={formData.Tags || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, Tags: e.target.value }))}
                        placeholder="e.g., tech, innovation, core"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setEditingDepartment(null);
setFormData({ Name: '', managerId: '', Tags: '' });
                      }}
                    >
                      Cancel
                    </Button>
<Button type="submit" disabled={formLoading}>
                      {formLoading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;