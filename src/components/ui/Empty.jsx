import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item", 
  action,
  actionLabel = "Add Item",
  icon = "Database"
}) => {
  return (
    <Card className="p-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <ApperIcon name={icon} className="text-gray-400" size={40} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action} icon="Plus" size="lg">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default Empty;