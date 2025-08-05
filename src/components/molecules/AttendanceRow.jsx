import React from "react";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const AttendanceRow = ({ attendance, employee }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      case "holiday":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "CheckCircle";
      case "absent":
        return "XCircle";
      case "late":
        return "Clock";
      case "holiday":
        return "Calendar";
      default:
        return "Circle";
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar
            src={employee?.photoUrl}
            alt={employee?.name}
            fallback={getInitials(employee?.name || "")}
            size="sm"
          />
          <span className="font-medium text-gray-900">{employee?.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {employee?.department}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {format(new Date(attendance.date), "MMM dd, yyyy")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={getStatusVariant(attendance.status)} className="gap-1">
          <ApperIcon name={getStatusIcon(attendance.status)} size={12} />
          {attendance.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {attendance.checkIn || "--:--"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {attendance.checkOut || "--:--"}
      </td>
    </tr>
  );
};

export default AttendanceRow;