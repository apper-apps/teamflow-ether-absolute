import React from "react";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const statusVariant = employee.status === "active" ? "success" : "error";

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={employee.photoUrl}
            alt={employee.name}
            fallback={getInitials(employee.name)}
            size="lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.role}</p>
          </div>
        </div>
        <Badge variant={statusVariant}>
          {employee.status}
        </Badge>
      </div>
      
<div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Building2" size={16} />
          <span>{employee.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Mail" size={16} />
          <span>{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Phone" size={16} />
          <span>{employee.phone}</span>
        </div>
        {employee.emergencyContacts && employee.emergencyContacts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Contact" size={16} />
            <span>
              {employee.emergencyContacts.length} Emergency Contact{employee.emergencyContacts.length !== 1 ? 's' : ''}
              {employee.emergencyContacts[0] && (
                <span className="text-gray-500 ml-1">
                  ({employee.emergencyContacts[0].name} - {employee.emergencyContacts[0].relationship})
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon="Edit2"
          onClick={() => onEdit(employee)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          icon="Trash2"
          onClick={() => onDelete(employee)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default EmployeeCard;