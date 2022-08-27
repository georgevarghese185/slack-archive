export class InvalidLoginIdError extends Error {
  constructor() {
    super(
      'This login was attempted from a different session. Try logging in again'
    );
  }
}
