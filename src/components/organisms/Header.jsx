import React from "react";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ title, searchValue, onSearchChange, showSearch = true, actions }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-sm text-gray-600">Manage your team efficiently</p>
        </div>
        
        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="w-80">
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search employees, departments..."
              />
            </div>
          )}
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
          
<Button variant="ghost" icon="Settings" size="md" />
        </div>
      </div>
    </div>
  );
};

export default Header;