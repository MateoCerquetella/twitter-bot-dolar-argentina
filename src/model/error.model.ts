export interface TwitterError {
  code: number;
  allErrors: Error[];
  twitterReply: TwitterReply;
  statusCode: number;
  errors: Error[];
}

export interface Error {
  code: number;
  message: string;
}

export interface TwitterReply {
  errors: Error[];
}
