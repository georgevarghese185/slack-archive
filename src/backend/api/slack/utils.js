const paginatedRequest = async (makeRequest, request) => {
  const response = await makeRequest(request);
  const json = await response.json();

  if(json.ok) {
    let next;
    if(json.response_metadata && json.response_metadata.next_cursor) {
      const newRequest = JSON.parse(JSON.stringify(request));
      newRequest.cursor = json.response_metadata.next_cursor;
      next = () => paginatedRequest(makeRequest, newRequest);
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

const withRetry = (fetch, onRateLimit) => {
  return async (url, options) => {
    const response = await fetch(url, options);
    if(response.status == 429 && response.headers.get('Retry-After') != null) {
      const retryAfter = parseInt(response.headers.get('Retry-After'))

      return await(new Promise(function(resolve, reject) {
        let onResume;
        setTimeout(function() {
          fetch(url, options).then(resolve).catch(reject);
          if(onResume) onResume();
        }, retryAfter * 1000);
        if(onRateLimit) {
          onResume = onRateLimit(retryAfter);
        }
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
