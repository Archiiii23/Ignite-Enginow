export const demoLoginValidator = {
  role: {
    required: true,
    enum: ["student", "organizer", "admin"],
  },
};

export const updateProfileValidator = {
  name: { type: "string", min: 2, max: 100 },
  headline: { type: "string", max: 200 },
  college: { type: "string", max: 150 },
  bio: { type: "string", max: 1000 },
  github: { type: "string", max: 200 },
  linkedin: { type: "string", max: 200 },
};
