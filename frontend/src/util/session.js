export const isLoggedIn = () => {
  return localStorage.getItem('loggedIn') === true
}
