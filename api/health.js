module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'online',
    system: 'VidyutSahayak Dispatch Core',
    timestamp: new Date().toISOString(),
    version: '1.2.0'
  });
};
