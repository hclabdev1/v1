
function DBConnector(dbms) {
  var trxCount = 0, dbSpeedAvg = 0;
  var log = 'yes';
  var myPool = require('mysql').createPool({
    port: dbms.port,
    host: dbms.host,
    user: dbms.user,
    password: dbms.password,
    multipleStatements: true,
    database: dbms.database
  });

  setLog = (yn) => {
    log = yn;
  }

  // query submit without return
  submit = (query, values) => {
    if (!query)
      return;
    if (log == 'yes')
      console.debug(`${new Date().toLocaleString()} query submitted \n ${query} \n values:${values}`);
    myPool.query(query, values, (err, res) => {
      if(err) {
        console.error(`${new Date().toLocaleString()} :: dbConnector:submit: ${query} :: ${err}`);
      }
    });
  }

  // query submit with return
  submitSync = (query, values) => {   
    if (!query)
      return null;
    return new Promise((resolve, reject) => {
      var start = Date.now();
      if (log == 'yes')
        console.debug(`${new Date().toLocaleString()} query submitted \n ${query} \n values:${values}`);
      myPool.query(query, values, (err, res) => {
        if (err) {
          console.error(`${new Date().toLocaleString()} :: dbConnector:submitSync: ${query} :: ${err}`);
          resolve(null);
          return;
        }
        var end = Date.now();
        trxCount++;
        dbSpeedAvg = (dbSpeedAvg * (trxCount - 1) + end - start) / trxCount;

        if(log == 'yes') 
          console.debug(`result: ${JSON.stringify(res)}`);
        if(res.length > 0)
          resolve(res);
        else if(res.length == undefined)
          resolve('ok');
        else
          resolve(null);
      });
    });
  }

  const dbConnector = {
    setLog,
    submit,
    submitSync
  }

  return dbConnector;
}

module.exports = DBConnector;