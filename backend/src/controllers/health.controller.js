const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
};

export { healthCheck };
