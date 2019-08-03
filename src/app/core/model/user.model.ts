export class User {
  constructor(
    public id: string,
    public email: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get token(): string {
    if (!this._tokenExpirationDate || this._tokenExpirationDate <= new Date()) {
      return null;
    }
    return this._token;
  }

  get tokenDuration(): number {
    if (!this.token) {
      return 0;
    }
    return this._tokenExpirationDate.getTime() - new Date().getTime();
  }
}
