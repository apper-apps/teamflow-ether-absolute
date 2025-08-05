import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { employeeService } from "@/services/api/employeeService";
import { attendanceService } from "@/services/api/attendanceService";
import { leaveRequestService } from "@/services/api/leaveRequestService";
import { departmentService } from "@/services/api/departmentService";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns";

const Reports = () => {
  const [data, setData] = useState({
    employees: [],
    attendance: [],
    leaveRequests: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employees, attendance, leaveRequests, departments] = await Promise.all([
        employeeService.getAll(),
        attendanceService.getAll(),
        leaveRequestService.getAll(),
        departmentService.getAll()
      ]);
      
      setData({ employees, attendance, leaveRequests, departments });
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading variant="stats" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Filter data based on selected month and department
  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));
  
  let filteredEmployees = data.employees;
  if (selectedDepartment) {
    filteredEmployees = filteredEmployees.filter(emp => emp.department === selectedDepartment);
  }

  const monthAttendance = data.attendance.filter(att => {
    const attDate = new Date(att.date);
    return attDate >= monthStart && attDate <= monthEnd;
  });

  const monthLeaveRequests = data.leaveRequests.filter(req => {
    const reqDate = new Date(req.startDate);
    return reqDate >= monthStart && reqDate <= monthEnd;
  });

  // Calculate metrics
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(emp => emp.status === "active").length;
  
  const workingDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    .filter(day => !isWeekend(day)).length;
  
  const totalPossibleAttendance = activeEmployees * workingDays;
  const totalPresent = monthAttendance.filter(att => 
    att.status === "present" && filteredEmployees.some(emp => emp.Id === att.employeeId)
  ).length;
  
  const attendanceRate = totalPossibleAttendance > 0 ? 
    Math.round((totalPresent / totalPossibleAttendance) * 100) : 0;

  const approvedLeaves = monthLeaveRequests.filter(req => 
    req.status === "approved" && filteredEmployees.some(emp => emp.Id === req.employeeId)
  ).length;

  const pendingLeaves = monthLeaveRequests.filter(req => 
    req.status === "pending" && filteredEmployees.some(emp => emp.Id === req.employeeId)
  ).length;

  // Department breakdown
  const departmentStats = data.departments.map(dept => {
    const deptEmployees = data.employees.filter(emp => emp.department === dept.name);
    const deptAttendance = monthAttendance.filter(att => 
      deptEmployees.some(emp => emp.Id === att.employeeId) && att.status === "present"
    );
    const deptWorkingDays = deptEmployees.filter(emp => emp.status === "active").length * workingDays;
    const deptAttendanceRate = deptWorkingDays > 0 ? 
      Math.round((deptAttendance.length / deptWorkingDays) * 100) : 0;

    return {
      name: dept.name,
      employees: deptEmployees.length,
      attendanceRate: deptAttendanceRate,
      leaves: monthLeaveRequests.filter(req => 
        deptEmployees.some(emp => emp.Id === req.employeeId)
      ).length
    };
  });

  return (
    <div className="p-6">
      <Header 
        title="Reports & Analytics" 
        showSearch={false}
        actions={
          <>
            <div className="w-48">
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                placeholder="All Departments"
              >
                <option value="">All Departments</option>
                {data.departments.map(dept => (
                  <option key={dept.Id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>
            <Button icon="Download" variant="secondary">
              Export
            </Button>
          </>
        }
      />
      
      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          change={`${activeEmployees} active`}
          changeType="neutral"
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          change={`${totalPresent}/${totalPossibleAttendance} days`}
          changeType={attendanceRate >= 80 ? "increase" : "decrease"}
          icon="Clock"
          color="success"
        />
        <StatCard
          title="Approved Leaves"
          value={approvedLeaves}
          change={`${pendingLeaves} pending`}
          changeType="neutral"
          icon="Calendar"
          color="accent"
        />
        <StatCard
          title="Working Days"
          value={workingDays}
          change={format(monthStart, "MMM yyyy")}
          changeType="neutral"
          icon="CalendarDays"
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
            <ApperIcon name="Building2" className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <span className="text-sm text-gray-600">{dept.employees} employees</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className={`font-medium ${dept.attendanceRate >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                    {dept.attendanceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Leave Requests</span>
                  <span className="font-medium text-gray-900">{dept.leaves}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${dept.attendanceRate >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${dept.attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <ApperIcon name="Activity" className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-3">
            {monthLeaveRequests
              .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
              .slice(0, 8)
              .map((request) => {
                const employee = data.employees.find(emp => emp.Id === request.employeeId);
                const statusColor = request.status === "approved" ? "text-green-600" : 
                                  request.status === "rejected" ? "text-red-600" : "text-yellow-600";
                
                return (
                  <div key={request.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                          {employee?.name?.split(" ").map(n => n[0]).join("") || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{employee?.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{request.type} leave</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${statusColor} capitalize`}>
                        {request.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(request.requestDate), "MMM dd")}
                      </p>
                    </div>
                  </div>
                );
              })}
            
            {monthLeaveRequests.length === 0 && (
              <div className="text-center py-8">
                <ApperIcon name="Activity" className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-500">No activity this month</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;