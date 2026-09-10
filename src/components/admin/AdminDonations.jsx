import React, { useEffect, useState } from 'react';
import { CheckCircle, DollarSign } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './AdminDonations.css';

const AdminDonations = ({ onAction }) => {
  const [donations, setDonations] = useState([]);
  const [totals, setTotals] = useState({ amount: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const loadDonations = async () => {
    try {
      const response = await axiosClient.get('/api/admin/donations');
      setDonations(response.data.data || []);
      setTotals(response.data.totals || { amount: 0, count: 0 });
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to load donations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDonations(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/donations/${id}/status`, { status });
      onAction({ type: 'success', text: 'Donation status updated.' });
      loadDonations();
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to update donation status' });
    }
  };

  return (
    <div className="admin-donations-desk">
      <div className="desk-header">
        <h2>Donation Records</h2>
        <p>Review donor details, contribution totals, receipts, and verification status.</p>
      </div>

      <div className="donation-summary-row">
        <div><DollarSign size={20} /><span><strong>₹{totals.amount.toLocaleString()}</strong>Total received</span></div>
        <div><CheckCircle size={20} /><span><strong>{totals.count}</strong>Contributions</span></div>
      </div>

      {loading ? <div className="events-admin-empty">Loading donation records...</div> : donations.length === 0 ? <div className="events-admin-empty">No donations received yet.</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead><tr><th>Donor</th><th>Contact</th><th>Amount</th><th>Frequency</th><th>Receipt</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation._id}>
                  <td><strong>{donation.donorName}</strong><div className="sub-text">{donation.donorEmail}</div>{donation.panNumber && <div className="sub-text">PAN: {donation.panNumber}</div>}</td>
                  <td>{donation.donorPhone}</td>
                  <td><strong>₹{donation.amount.toLocaleString()}</strong></td>
                  <td>{donation.frequency}</td>
                  <td><code>{donation.receiptNumber}</code></td>
                  <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                  <td><select className={`status-select ${donation.status}`} value={donation.status} onChange={(event) => updateStatus(donation._id, event.target.value)}><option value="received">RECEIVED</option><option value="verified">VERIFIED</option><option value="cancelled">CANCELLED</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
