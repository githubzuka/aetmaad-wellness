import React, { useState, useEffect } from 'react';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-customers-page">
      <div className="admin-header">
        <h2>Customer Details</h2>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="table-responsive-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Joined Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No customer records found</td></tr>
            ) : (
              customers.map((cust, idx) => (
                <tr key={cust._id}>
                  <td>{idx + 1}</td>
                  <td><strong>{cust.name}</strong></td>
                  <td>{cust.email}</td>
                  <td>{cust.phone || 'N/A'}</td>
                  <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;