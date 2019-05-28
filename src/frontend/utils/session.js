const isSignedIn = () => {
  return window.localStorage.getItem('signed_in') == "true";
}

export {
  isSignedIn
}
