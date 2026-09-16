export const organizerRequestValidator = {
  organizationName: { required: true, type: "string", min: 2, max: 150 },
  contactEmail: { type: "email" },
};

export const organizerRejectValidator = {
  rejectionReason: { required: true, type: "string", min: 3 },
};
