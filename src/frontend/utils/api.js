class ApiError extends Error {
  constructor(code, errorResponse) {
    super(errorResponse.errorMessage ? errorMessage : JSON.stringify(errorResponse));
    this.code = code;
    this.errorResponse = errorResponse;
  }
}

const withError = async (response) => {
  if(!response.ok) {
    let errorResponse;
    const text = response.text();
    try {
      errorResponse = JSON.parse(text);
    } catch {
      errorResponse = {
        errorMessage: text
      }
    }
    throw new ApiError(response.status, errorResponse);
  } else {
    return response;
  }
}


const getSlackAuthUrl = async () => {
  const response = await withError(await fetch('/api/slack/OAuth/authUrl'));
  const json = await response.json();
  return json.redirectUrl
}

const signOut = async () => {
  await withError(await fetch('/api/signOut'));
}

export {
  ApiError,
  withError,
  getSlackAuthUrl,
  signOut
}
