import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Employees", href: "/employees", icon: "Users" },
    { name: "Attendance", href: "/attendance", icon: "Clock" },
    { name: "Leave Management", href: "/leave-management", icon: "Calendar" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        <ApperIcon name={item.icon} size={20} />
        <span>{item.name}</span>
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <ApperIcon name="Users" className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TeamFlow</h1>
            <p className="text-xs text-gray-500">Employee Management</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <ApperIcon name="Users" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TeamFlow</h1>
                <p className="text-xs text-gray-500">Employee Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
          
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;