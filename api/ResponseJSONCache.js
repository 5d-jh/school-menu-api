module.exports = class {
  constructor () {
    this.cachedResponses = [];
    this.cacheTime = 345600000/*4일*/;
  }

  getCachedMenu (schoolCode, year, month) {
    for (const i in this.cachedResponses) {
      if (this.cachedResponses[i]) {
        if ((this.cachedResponses[i].menuYear == year) 
        && (this.cachedResponses[i].menuMonth == month) 
        && (this.cachedResponses[i].schoolCode == schoolCode)) {
          return [JSON.parse(JSON.stringify(this.cachedResponses[i].response)), this.cachedResponses[i].timeCached];
        }
      }
    }
    return null;
  }

  cacheMenu (schoolCode, monthlyMenu, year, month) {
    const cacheId = Math.floor(Math.random() * (10000 - 1000) + 1000);
    
    this.cachedResponses.push({
      response: {menu: monthlyMenu, server_message: require('./serverMessage.json').content},
      schoolCode: schoolCode,
      menuYear: year,
      menuMonth: month,
      timeCached: new Date(),
      cacheId: cacheId,
      selfDestroyTrigger: (() => {
        setTimeout(() => {
          const index = this.cachedResponses.findIndex((element) => {
            return element.cacheId === cacheId;
          })
          this.cachedResponses.splice(index, 1);
        }, this.cacheTime);
        return 'enabled';
      })()
    });
  }
}