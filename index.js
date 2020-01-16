const { menuService } = require('./menu-service/service');
const { infoService } = require('./info-service/service');

exports.api = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const data = await menuService(req.path, req.query);
    res.json({
      menu: data.menu,
      server_message: [
        data.isFetchedFromDB ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.'
      ]
    });
  } catch(err) {
    res.status(500).json({ menu: [], server_message: [err] })
  }
}

exports.neis = async(req, res) => {
  try {
    res.send(await infoService(req.path, req.query));
  } catch(err) {
    console.error(err);
    res.send(err);
  }
}