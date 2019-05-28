const isSignedIn = () => {
  return window.localStorage.getItem('signed_in') == "true";
}

const setSignedIn = () => {
  window.localStorage.setItem('signed_in', true);
}

const setSignedOut = () => {
  window.localStorage.clear('signed_in');
}

export {
  isSignedIn,
  setSignedIn,
  setSignedOut
}
