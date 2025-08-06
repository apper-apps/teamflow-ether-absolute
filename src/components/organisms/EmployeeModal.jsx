import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { departmentService } from "@/services/api/departmentService";
import ApperIcon from "@/components/ApperIcon";
import DepartmentModal from "@/components/organisms/DepartmentModal";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const EmployeeModal = ({ isOpen, onClose, employee, onSave, departments, onDepartmentRefresh }) => {
const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    photoUrl: "",
    status: "active",
    emergencyContacts: []
  });
  const [loading, setLoading] = useState(false);

useEffect(() => {
    if (employee) {
      // Handle department lookup field properly
      let departmentValue = "";
      if (employee.department) {
        // If department is a lookup object, use the Id
        if (typeof employee.department === 'object' && employee.department.Id) {
          departmentValue = employee.department.Id.toString();
        } else {
          departmentValue = employee.department.toString();
        }
      }
      
      setFormData({
        name: employee.name || employee.Name || "",
        email: employee.email || "",
        role: employee.role || "",
        department: departmentValue,
        phone: employee.phone || "",
        photoUrl: employee.photoUrl || "",
        status: employee.status || "active",
        emergencyContacts: employee.emergencyContacts || []
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        phone: "",
        photoUrl: "",
        status: "active",
        emergencyContacts: []
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setLoading(false);
    }
  };

const [showDepartmentModal, setShowDepartmentModal] = useState(false);

const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for "Add New Department" option
    if (name === 'department' && value === '__add_new__') {
      handleAddDepartment();
      return;
    }
    
    // For department field, ensure we store the ID as string for lookup fields
    const formValue = name === 'department' ? value : value;
    setFormData(prev => ({ ...prev, [name]: formValue }));
  };

  const handleAddDepartment = () => {
    setShowDepartmentModal(true);
  };

  const handleDepartmentSave = async (departmentData) => {
    try {
      await departmentService.create(departmentData);
      toast.success("Department created successfully");
      setShowDepartmentModal(false);
      
      // Refresh departments list in parent component
      if (onDepartmentRefresh) {
        await onDepartmentRefresh();
      }
    } catch (error) {
      toast.error("Failed to create department");
      throw error;
    }
  };

  const handleAddEmergencyContact = () => {
    const newContact = {
      id: Date.now(),
      name: "",
      relationship: "",
      phone: "",
      email: ""
    };
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const handleRemoveEmergencyContact = (contactId) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== contactId)
    }));
  };

  const handleEmergencyContactChange = (contactId, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact =>
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {employee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <Button
                variant="ghost"
                icon="X"
                onClick={onClose}
                size="sm"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
<Select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="__add_new__" className="text-primary-600 font-medium">
                    + Add New Department
                  </option>
                  {departments.map(dept => (
                    <option key={dept.Id} value={dept.Id.toString()}>
                      {dept.name || dept.Name}
                    </option>
                  ))}
                </Select>
</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <Input
                label="Photo URL (Optional)"
                name="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />

              {/* Emergency Contacts Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="Plus"
                    onClick={handleAddEmergencyContact}
                  >
                    Add Contact
                  </Button>
                </div>

                {formData.emergencyContacts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <ApperIcon name="Users" size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No emergency contacts added yet</p>
                    <p className="text-sm">Click "Add Contact" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.emergencyContacts.map((contact, index) => (
                      <Card key={contact.id} className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon="Trash2"
                            onClick={() => handleRemoveEmergencyContact(contact.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            label="Full Name"
                            value={contact.name}
                            onChange={(e) => handleEmergencyContactChange(contact.id, 'name', e.target.value)}
                            placeholder="Enter contact name"
                            required
                          />
                          <Select
                            label="Relationship"
                            value={contact.relationship}
                            onChange={(e) => handleEmergencyContactChange(contact.id, 'relationship', e.target.value)}
                            required
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Partner">Partner</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                          </Select>
                          <Input
                            label="Phone Number"
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => handleEmergencyContactChange(contact.id, 'phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                          <Input
                            label="Email Address"
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleEmergencyContactChange(contact.id, 'email', e.target.value)}
                            placeholder="contact@email.com"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  {employee ? "Update Employee" : "Add Employee"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Department Modal */}
      <DepartmentModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSave={handleDepartmentSave}
      />
    </>
);
};

export default EmployeeModal;