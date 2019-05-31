const glob = require('glob');
const path = require('path');

const getConfig = async function() {
  const dev = process.env.ENV == "development";
  const port = process.env.PORT || 8080
  const url = process.env.SERVER_URL || ("http://localhost:" + port)

  const files = await new Promise(function(resolve, reject) {
    glob(path.join(__dirname, '../../../dist/index-*.js'), (err, files) => resolve(files));
  });

  let indexId;
  if(dev) {
    indexId = '';
  } else if (!files || files.length == 0) {
    throw new Error("Can't find dist/index-<hash>.js");
  } else {
    indexId = files[0].match(/index(-[\d\w]+).js$/)[1];
  }

  return {
    port,
    url,
    indexId
  }
}

module.exports = getConfig
