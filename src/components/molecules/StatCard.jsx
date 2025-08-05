import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, change, changeType, icon, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    accent: "from-accent-500 to-accent-600", 
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600"
  };

  const changeColor = changeType === "increase" 
    ? "text-green-600" 
    : changeType === "decrease" 
    ? "text-red-600" 
    : "text-gray-600";

  const changeIcon = changeType === "increase" 
    ? "TrendingUp" 
    : changeType === "decrease" 
    ? "TrendingDown" 
    : "Minus";

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
              <ApperIcon name={changeIcon} size={16} />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <ApperIcon name={icon} className="text-white" size={24} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;