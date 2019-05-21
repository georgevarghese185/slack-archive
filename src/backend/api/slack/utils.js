const paginatedRequest = async (makeRequest, params) => {
  const response = await makeRequest(params);
  const json = await response.json();

  if(json.ok) {
    let next;
    if(json.response_metadata && json.response_metadata.next_cursor) {
      const newParams = JSON.parse(JSON.stringify(params));
      newParams.cursor = json.response_metadata.next_cursor;
      next = () => paginatedRequest(makeRequest, newParams);
    }
    return {
      response: json,
      next
    }
  } else {
    return {
      response: json
    }
  }
}

const withRetry = (fetch, onRetry) => {
  return async (url, options) => {
    const response = await fetch(url, options);
    if(response.status == 429 && response.headers.get('Retry-After') != null) {
      const retryAfter = parseInt(response.headers.get('Retry-After'))
      if(onRetry) {
        onRetry();
      }
      return await(new Promise(function(resolve, reject) {
        setTimeout(function() {
          fetch(url, options).then(resolve).catch(reject);
        }, retryAfter * 1000);
      }));
    } else {
      return response;
    }
  }
}

module.exports = {
  paginatedRequest,
  withRetry
}
