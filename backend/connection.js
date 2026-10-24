
const mongoose = require('mongoose');
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1","8.8.8.8"]);

const url = "mongodb+srv://protocol1919rule_db_user:pWEJf8tsTPocJz95@cluster0.gjg3yfs.mongodb.net/mydb?appName=Cluster0"

// asynchronous functional - returns promise object

mongoose.connect(url)
.then((result) => {

  console.log('database connected');
  
}).catch((err) => {

  console.log(err);
  
});