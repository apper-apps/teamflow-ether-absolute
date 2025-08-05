import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import LeaveRequestCard from "@/components/molecules/LeaveRequestCard";
import LeaveRequestModal from "@/components/organisms/LeaveRequestModal";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { leaveRequestService } from "@/services/api/leaveRequestService";
import { employeeService } from "@/services/api/employeeService";
import { toast } from "react-toastify";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [leaveRequestsData, employeesData] = await Promise.all([
        leaveRequestService.getAll(),
        employeeService.getAll()
      ]);
      
      setLeaveRequests(leaveRequestsData);
      setEmployees(employeesData);
      setFilteredLeaveRequests(leaveRequestsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = leaveRequests;
    
    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    if (searchTerm) {
      const employeeIds = employees
        .filter(emp => 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(emp => emp.Id);
      
      filtered = filtered.filter(req => employeeIds.includes(req.employeeId));
    }
    
    // Sort by request date (newest first)
    filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    setFilteredLeaveRequests(filtered);
  }, [leaveRequests, statusFilter, searchTerm, employees]);

  const handleApprove = async (request) => {
    try {
      await leaveRequestService.update(request.Id, { ...request, status: "approved" });
      toast.success("Leave request approved successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async (request) => {
    try {
      await leaveRequestService.update(request.Id, { ...request, status: "rejected" });
      toast.success("Leave request rejected");
      loadData();
    } catch (error) {
      toast.error("Failed to reject leave request");
    }
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await leaveRequestService.create(requestData);
      toast.success("Leave request submitted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to submit leave request");
      throw error;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) return <Loading variant="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      <Header 
        title="Leave Management" 
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        actions={
          <>
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="All Status"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <Button icon="Plus" onClick={() => setModalOpen(true)}>
              New Request
            </Button>
          </>
        }
      />

      {filteredLeaveRequests.length === 0 ? (
        <Empty
          title="No leave requests found"
          description="Submit your first leave request or adjust your filters"
          action={() => setModalOpen(true)}
          actionLabel="New Request"
          icon="Calendar"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaveRequests.map((request) => {
            const employee = employees.find(emp => emp.Id === request.employeeId);
            return (
              <LeaveRequestCard
                key={request.Id}
                request={request}
                employee={employee}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            );
          })}
        </div>
      )}

      <LeaveRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitRequest}
        employees={employees}
      />
    </div>
  );
};

export default LeaveManagement;