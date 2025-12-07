// GET / - API health check
export const GET = () => {
  return {
    message: "Welcome to bev-fs API",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  };
};

// POST / - Create something
export const POST = ({ body }: any) => {
  return {
    success: true,
    message: "POST received",
    body
  };
};
