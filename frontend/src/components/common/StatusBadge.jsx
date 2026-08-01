import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalize = status ? status.toUpperCase() : 'PENDING';

  switch (normalize) {
    case 'APPROVED':
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'VALID':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={12} /> {normalize}
        </span>
      );
    case 'PENDING':
    case 'RESERVED':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> {normalize}
        </span>
      );
    case 'REJECTED':
    case 'CANCELLED':
    case 'DAMAGED':
    case 'OVERDUE':
      return (
        <span className="badge badge-rejected">
          <XCircle size={12} /> {normalize}
        </span>
      );
    default:
      return (
        <span className="badge badge-pending">
          <AlertTriangle size={12} /> {normalize}
        </span>
      );
  }
};
