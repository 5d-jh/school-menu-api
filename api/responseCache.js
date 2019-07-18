const process = require('process');
const AWS = require('aws-sdk');

const NODE_ENV = process.env.NODE_ENV;
const TableName = NODE_ENV === 'development' ? 'SchoolMenu_dev' : 'SchoolMenu';

// *** AWS Lambda 가 아닌 환경에서 실행할 경우 다음 코드의 주석을 해제합니다. ***
// AWS.config.update({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

const docCli = new AWS.DynamoDB.DocumentClient();

const getMenu = require('./getMenu');

function willStore(menuYear, menuMonth) {
  const date = new Date();
  return date.getFullYear() >= menuYear && date.getMonth()+1 >= menuMonth;
}

/**
 * @param {"elementary"|"moddle"|"high"} schoolType - 학교 유형
 * @param {string} schoolCode - 학교 고유 NEIS 코드
 * @param {number} menuYear - 식단 년
 * @param {number} menuMonth - 식단 월
 * @returns {Promise<{ schoolMenu: array, isCached: boolean }>}
 */
module.exports = async (schoolType, schoolCode, menuYear, menuMonth) => {
  const params = {
    TableName,
    Key: {
      'MenuYM': `${menuYear}.${menuMonth}`,
      'SchoolCode': schoolCode,
    }
  };
  const ddbResult = await docCli.get(params).promise()
  .catch(err => err);

  if (ddbResult.Item === undefined) { //오브젝트가 존재하지 않는 경우
    const isCached = false;

    if (willStore(menuYear, menuMonth)) { //과거 또는 현재 식단을 요쳥한 경우
      try {
        const schoolMenu = await getMenu(schoolType, schoolCode, menuYear, menuMonth);
  
        if (schoolMenu && schoolMenu.hasData) {
          docCli.put({
            TableName,
            Item: {
              'MenuYM': `${menuYear}.${menuMonth}`,
              'SchoolCode': schoolCode,
              'SchoolMenu': schoolMenu.menu
            }
          }, err => {
            if (err) throw err;
          });
        }
  
        return {
          schoolMenu: schoolMenu.menu,
          isCached
        };
  
      } catch(err) {
        throw err;
      }
    }

    //미래 식단을 요청한 경우
    const { menu } = await getMenu(schoolType, schoolCode, menuYear, menuMonth);
    return {
      schoolMenu: menu,
      isCached
    };
  }

  return { schoolMenu: ddbResult.Item.SchoolMenu, isCached: true };
}