import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import { format } from "date-fns";

const LeaveRequestModal = ({ isOpen, onClose, onSubmit, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        status: "pending",
        requestDate: format(new Date(), "yyyy-MM-dd")
      });
      setFormData({
        employeeId: "",
        type: "",
        startDate: "",
        endDate: "",
        reason: ""
      });
      onClose();
    } catch (error) {
      console.error("Error submitting leave request:", error);
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
        <Card className="w-full max-w-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Submit Leave Request
              </h2>
              <Button
                variant="ghost"
                icon="X"
                onClick={onClose}
                size="sm"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.Id} value={emp.Id}>
                    {emp.name} - {emp.department}
                  </option>
                ))}
              </Select>

              <Select
                label="Leave Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Please provide a reason for your leave request..."
                />
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
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};

export default LeaveRequestModal;