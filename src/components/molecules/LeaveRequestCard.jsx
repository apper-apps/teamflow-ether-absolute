import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const LeaveRequestCard = ({ request, employee, onApprove, onReject }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "vacation":
        return "Sun";
      case "sick":
        return "Heart";
      case "personal":
        return "User";
      default:
        return "Calendar";
    }
  };

  const duration = differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={employee?.photoUrl}
            alt={employee?.name}
            fallback={getInitials(employee?.name || "")}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{employee?.name}</h3>
            <p className="text-sm text-gray-600">{employee?.department}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(request.status)}>
          {request.status}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <ApperIcon name={getTypeIcon(request.type)} size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700 capitalize">{request.type} Leave</span>
          <span className="text-gray-500">• {duration} day{duration > 1 ? "s" : ""}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Calendar" size={16} />
          <span>
            {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Clock" size={16} />
          <span>Requested on {format(new Date(request.requestDate), "MMM dd, yyyy")}</span>
        </div>
        
        {request.reason && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{request.reason}</p>
          </div>
        )}
      </div>

      {request.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            icon="Check"
            onClick={() => onApprove(request)}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon="X"
            onClick={() => onReject(request)}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
};

export default LeaveRequestCard;