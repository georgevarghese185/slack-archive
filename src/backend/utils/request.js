const getQueryString = params => {
  return Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join("&")
}

const withRetry = async (makeRequest, onRetry) => {
  const response = await makeRequest();
  if(response.status == 429 && response.headers.get('Retry-After') != null) {
    const retryAfter = parseInt(response.headers.get('Retry-After'));
    if(onRetry) {
      onRetry();
    }
    return await(new Promise(function(resolve, reject) {
      setTimeout(function() {
        makeRequest(makeRequest, onRetry).then(resolve).catch(reject);
      }, retryAfter);
    }));
  } else {
    return response;
  }
}

module.exports = {
  getQueryString,
  withRetry
}
