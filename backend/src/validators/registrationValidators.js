export const registerValidator = {
  userName: { type: "string", min: 2 },
  userEmail: { type: "email" },
};

export const eventRejectValidator = {
  rejectionReason: { required: true, type: "string", min: 3 },
};
