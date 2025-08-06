import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const DepartmentModal = ({ isOpen, onClose, department, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    Tags: "",
    managerId: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || department.Name || "",
        Tags: department.Tags || "",
        managerId: department.managerId || ""
      });
    } else {
      setFormData({
        name: "",
        Tags: "",
        managerId: ""
      });
    }
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving department:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {department ? "Edit Department" : "Create New Department"}
              </h2>
              <Button
                variant="ghost"
                icon="X"
                onClick={onClose}
                size="sm"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Department Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter department name"
                required
              />

              <Input
                label="Tags (Optional)"
                name="Tags"
                value={formData.Tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas"
              />

              <Input
                label="Manager ID (Optional)"
                name="managerId"
                type="number"
                value={formData.managerId}
                onChange={handleChange}
                placeholder="Enter manager employee ID"
              />

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
                  {department ? "Update Department" : "Create Department"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DepartmentModal;