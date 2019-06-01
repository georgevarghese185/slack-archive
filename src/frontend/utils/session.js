const isSignedIn = () => {
  return window.localStorage.getItem('signed_in') == "true";
}

const setSignedIn = (store) => {
  window.localStorage.setItem('signed_in', true);
  if(store) {
    store.commit('signIn');
  }
}

const setSignedOut = (store) => {
  window.localStorage.clear('signed_in');
  if(store) {
    store.commit('signOut')
  }
}

export {
  isSignedIn,
  setSignedIn,
  setSignedOut
}
