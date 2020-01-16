const { menuService } = require('./menu-service/service');
const { infoService } = require('./info-service/service');
const package = require('./package.json');

const COMMON_MSGS = [
  '문제가 발생했거나 건의사항이 있는 경우 GitHub 저장소 페이지에 이슈를 남겨주세요: https://github.com/5d-jh/school-menu-api/issues',
  `v${package.version}`
];

exports.api = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const data = await menuService(req.path, req.query);
    res.json({
      menu: data.menu,
      server_message: [
        data.isFetchedFromDB ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.',
        ...COMMON_MSGS
      ]
    });
  } catch(err) {
    res.status(500).json({ menu: [], server_message: [err] });
  }
}

exports.neis = async(req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const result = await infoService(req.path, req.query);
    if (result.type === 'html') {
      return res.send(result.data);
    }
    if (result.type === 'json') {
      return res.json({
        school_infos: result.data,
        server_message: [...COMMON_MSGS]
      });
    }
  } catch(err) {
    res.status(500).json({ menu: [], server_message: [err] });
  }
}