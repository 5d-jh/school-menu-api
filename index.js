const { service } = require('./menu/service');

exports.api = async (req, res) => {
  try {
    res.json(await service(req.path, req.query));
  } catch(err) {
    res.status(500).json({ menu: [], server_message: [err] })
  }
}