/**
 * CSV Exporter for Participant Registrations
 */
export const generateParticipantsCsv = (registrations) => {
  const headers = [
    "Registration ID",
    "Ticket Code",
    "Seat Number",
    "Participant Name",
    "Email",
    "College",
    "Phone",
    "Status",
    "Registered Date",
  ];

  const escapeField = (field) => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = registrations.map((r) => [
    escapeField(r._id || r.id),
    escapeField(r.ticketCode || ""),
    escapeField(r.seatNumber || ""),
    escapeField(r.user?.name || r.userName || ""),
    escapeField(r.user?.email || r.userEmail || ""),
    escapeField(r.college || r.user?.college || "N/A"),
    escapeField(r.phone || r.user?.phone || "N/A"),
    escapeField(r.status || "REGISTERED"),
    escapeField(r.registeredAt ? new Date(r.registeredAt).toISOString() : new Date().toISOString()),
  ]);

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ];

  return csvLines.join("\r\n");
};
