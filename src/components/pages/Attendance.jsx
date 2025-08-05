import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import AttendanceRow from "@/components/molecules/AttendanceRow";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { attendanceService } from "@/services/api/attendanceService";
import { employeeService } from "@/services/api/employeeService";
import { toast } from "react-toastify";
import { format, isToday } from "date-fns";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [attendanceData, employeesData] = await Promise.all([
        attendanceService.getAll(),
        employeeService.getAll()
      ]);
      
      setAttendance(attendanceData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = attendance.filter(att => att.date === selectedDate);
    
    if (searchTerm) {
      const employeeIds = employees
        .filter(emp => 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(emp => emp.Id);
      
      filtered = filtered.filter(att => employeeIds.includes(att.employeeId));
    }
    
    setFilteredAttendance(filtered);
  }, [attendance, selectedDate, searchTerm, employees]);

  const handleMarkAttendance = async () => {
    try {
      // Get employees not marked for selected date
      const existingAttendance = attendance.filter(att => att.date === selectedDate);
      const markedEmployeeIds = existingAttendance.map(att => att.employeeId);
      const unmarkedEmployees = employees.filter(emp => 
        emp.status === "active" && !markedEmployeeIds.includes(emp.Id)
      );

      if (unmarkedEmployees.length === 0) {
        toast.info("All employees have been marked for this date");
        return;
      }

      // Mark all unmarked employees as present for the selected date
      const promises = unmarkedEmployees.map(emp =>
        attendanceService.create({
          employeeId: emp.Id,
          date: selectedDate,
          checkIn: format(new Date(), "HH:mm"),
          checkOut: null,
          status: "present"
        })
      );

      await Promise.all(promises);
      toast.success(`Marked ${unmarkedEmployees.length} employees as present`);
      loadData();
    } catch (error) {
      toast.error("Failed to mark attendance");
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <Loading variant="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      <Header 
        title="Attendance Tracking" 
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        actions={
          <>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-40"
            />
            <Button 
              icon="Clock" 
              onClick={handleMarkAttendance}
              disabled={!isToday(new Date(selectedDate))}
            >
              Mark Present
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        {filteredAttendance.length === 0 ? (
          <Empty
            title="No attendance records"
            description={`No attendance data found for ${format(new Date(selectedDate), "MMMM dd, yyyy")}`}
            action={isToday(new Date(selectedDate)) ? handleMarkAttendance : null}
            actionLabel="Mark Attendance"
            icon="Clock"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map((attendance) => {
                  const employee = employees.find(emp => emp.Id === attendance.employeeId);
                  return (
                    <AttendanceRow
                      key={attendance.Id}
                      attendance={attendance}
                      employee={employee}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Attendance;