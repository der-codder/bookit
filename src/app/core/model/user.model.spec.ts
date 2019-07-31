import { User } from './user.model';

const now = new Date(2019, 7, 17);

describe('User', () => {
  beforeEach(() => {
    jasmine.clock().mockDate(now);
  });

  describe('get token()', () => {
    it('should return proper token if it not expired', () => {
      const expectedToken = 'token_test';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const user = new User(null, null, expectedToken, tomorrow);

      expect(user.token).toEqual(expectedToken);
    });

    it('should return null if tokenExpirationDate is null', () => {
      const expectedToken = 'token_test';

      const user = new User(null, null, expectedToken, null);

      expect(user.token).toBeNull();
    });

    it('should return null if token is expired', () => {
      const expectedToken = 'token_test';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const user = new User(null, null, expectedToken, yesterday);

      expect(user.token).toBeNull();
    });
  });

  describe('get tokenDuration()', () => {
    it('should return proper duration', () => {
      const expectedToken = 'token_test';
      const twoMinutes = new Date();
      twoMinutes.setMinutes(twoMinutes.getMinutes() + 2);

      const user = new User(null, null, expectedToken, twoMinutes);

      expect(user.tokenDuration).toEqual(2 * 60 * 1000);
    });

    it('should return 0 duration if token is null', () => {
      const twoMinutes = new Date();
      twoMinutes.setMinutes(twoMinutes.getMinutes() + 2);

      const user = new User(null, null, null, twoMinutes);

      expect(user.tokenDuration).toEqual(0);
    });

    it('should return 0 duration if token is expired', () => {
      const minusTwoMinutes = new Date();
      minusTwoMinutes.setMinutes(minusTwoMinutes.getMinutes() - 2);

      const user = new User(null, null, null, minusTwoMinutes);

      expect(user.tokenDuration).toEqual(0);
    });
  });

  describe('isAuthenticated(user: User): boolean', () => {
    it('should return true if user has not expired token', () => {
      const expectedToken = 'token_test';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const user = new User(null, null, expectedToken, tomorrow);

      const actual = User.isAuthenticated(user);

      expect(actual).toBeTruthy();
    });

    it('should return false if user is null', () => {
      const actual = User.isAuthenticated(null);

      expect(actual).toBeFalsy();
    });

    it('should return false if user has expired token', () => {
      const expectedToken = 'token_test';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const user = new User(null, null, expectedToken, yesterday);

      const actual = User.isAuthenticated(user);

      expect(actual).toBeFalsy();
    });
  });
});
