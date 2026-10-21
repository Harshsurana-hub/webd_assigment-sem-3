function errorHandler(errorObj, req, res, next) {
  const statusVal = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusVal).json({
    message: errorObj.message || "Internal Server Error"
  });
}

module.exports = errorHandler;
