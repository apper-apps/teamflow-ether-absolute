import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format, isToday } from "date-fns";
import { attendanceService } from "@/services/api/attendanceService";
import { employeeService } from "@/services/api/employeeService";
import { leaveRequestService } from "@/services/api/leaveRequestService";
import { departmentService } from "@/services/api/departmentService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Header from "@/components/organisms/Header";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Dashboard = () => {
const [data, setData] = useState({
    employees: [],
    attendance: [],
    leaveRequests: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const loadDashboardData = async () => {
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
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApproveLeave = async (request) => {
    try {
      await leaveRequestService.update(request.Id, { ...request, status: "approved" });
      toast.success("Leave request approved successfully");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to approve leave request");
    }
  };

  const handleRejectLeave = async (request) => {
    try {
      await leaveRequestService.update(request.Id, { ...request, status: "rejected" });
      toast.success("Leave request rejected");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to reject leave request");
    }
  };

  if (loading) return <Loading variant="stats" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
const totalEmployees = data.employees.length;
  const activeEmployees = data.employees.filter(emp => emp.status === "active").length;
  const todaysAttendance = data.attendance.filter(att => isToday(new Date(att.date)));
  const presentToday = todaysAttendance.filter(att => att.status === "present").length;
  const pendingLeaves = data.leaveRequests.filter(req => req.status === "pending").length;
  const totalDepartments = data.departments.length;

  const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  return (
    <div className="p-6">
      <Header 
        title="Dashboard" 
        showSearch={false}
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          change="+2 this month"
          changeType="increase"
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees}
          change={`${Math.round((activeEmployees/totalEmployees)*100)}% of total`}
          changeType="neutral"
          icon="UserCheck"
          color="success"
        />
        <StatCard
          title="Present Today"
          value={presentToday}
          change={`${attendancePercentage}% attendance`}
          changeType={attendancePercentage >= 80 ? "increase" : "decrease"}
          icon="Clock"
          color="accent"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          change="Needs review"
          changeType="neutral"
          icon="Calendar"
          color="warning"
        />
</div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon="Users"
            trend={{ value: activeEmployees, label: "Active" }}
            color="blue"
          />
          <StatCard
            title="Today's Attendance"
            value={`${attendancePercentage}%`}
            icon="Clock"
            trend={{ value: presentToday, label: "Present" }}
            color="green"
          />
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves}
            icon="Calendar"
            trend={{ value: 0, label: "This week" }}
            color="orange"
          />
          <StatCard
            title="Departments"
            value={totalDepartments}
            icon="Building"
            trend={{ value: totalDepartments, label: "Total" }}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Attendance */}
          <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <Badge variant="info">{format(new Date(), "MMM dd, yyyy")}</Badge>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {todaysAttendance.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Clock" className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-500">No attendance records for today</p>
              </div>
            ) : (
              todaysAttendance.map((attendance) => {
const employee = data.employees.find(emp => emp.Id === attendance.employeeId);
                const statusColor = attendance.status === "present" ? "success" : 
                                 attendance.status === "late" ? "warning" : "error";
                
                return (
                  <div key={attendance.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
<span className="text-xs font-semibold text-gray-600">
                          {(employee?.name || employee?.Name)?.split(" ").map(n => n[0]).join("") || "?"}
                        </span>
                      </div>
                      <div>
<p className="font-medium text-gray-900">{employee?.name || employee?.Name}</p>
                        <p className="text-sm text-gray-600">{employee?.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusColor}>{attendance.status}</Badge>
                      {attendance.checkIn && (
                        <p className="text-xs text-gray-500 mt-1">{attendance.checkIn}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Pending Leave Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h3>
            <Badge variant="warning">{pendingLeaves} pending</Badge>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.leaveRequests.filter(req => req.status === "pending").length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-500">No pending leave requests</p>
              </div>
            ) : (
              data.leaveRequests
                .filter(req => req.status === "pending")
                .slice(0, 5)
                .map((request) => {
                  const employee = data.employees.find(emp => emp.Id === request.employeeId);
                  
                  return (
                    <div key={request.Id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
<p className="font-medium text-gray-900">{employee?.name || employee?.Name}</p>
                          <p className="text-sm text-gray-600 capitalize">{request.type} leave</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd")}
                          </p>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          icon="Check"
                          onClick={() => handleApproveLeave(request)}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon="X"
                          onClick={() => handleRejectLeave(request)}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;