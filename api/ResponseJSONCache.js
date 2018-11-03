module.exports = class {
  constructor () {
    this.cachedResponses = [];
  }

  getCachedMenu (schoolCode, year, month) {
    for (const i in this.cachedResponses) {
      if ((this.cachedResponses[i].menuYear == year) 
       && (this.cachedResponses[i].menuMonth == month) 
       && (this.cachedResponses[i].schoolCode == schoolCode)) {
        return [JSON.parse(JSON.stringify(this.cachedResponses[i].response)), this.cachedResponses[i].timeCached];
      }
    }
    return null;
  }

  cacheMenu (schoolCode, monthlyMenu, year, month) {
    const cacheIndex = this.cachedResponses.length;
    
    this.cachedResponses.push({
      response: {menu: monthlyMenu, server_message: require('./serverMessage.json').content},
      schoolCode: schoolCode,
      menuYear: year,
      menuMonth: month,
      timeCached: new Date(),
      selfDestroyTrigger: () => {
        setTimeout(() => {
          this.cachedResponses.splice(cacheIndex, 1);
        }, 3.6e+6);
      }
    });

    this.cachedResponses[cacheIndex].selfDestroyTrigger();
  }
}