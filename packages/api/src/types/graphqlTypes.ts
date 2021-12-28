export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ActionTypesQueryItem = {
  __typename?: 'ActionTypesQueryItem';
  actionType?: Maybe<Scalars['String']>;
  occurrences?: Maybe<Scalars['Int']>;
  properties?: Maybe<Array<Maybe<PropertyMetadata>>>;
};

export type PropertyMetadata = {
  __typename?: 'PropertyMetadata';
  isReference?: Maybe<Scalars['Boolean']>;
  location?: Maybe<YamlLineLocation>;
  trigger?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  actionTypes?: Maybe<Array<Maybe<ActionTypesQueryItem>>>;
};


export type QueryActionTypesArgs = {
  trigger?: InputMaybe<Scalars['String']>;
};

export type Reference = {
  __typename?: 'Reference';
  isRoot?: Maybe<Scalars['Boolean']>;
  kind?: Maybe<ReferenceKind>;
};

export enum ReferenceKind {
  Await = 'AWAIT',
  Eval = 'EVAL',
  Merge = 'MERGE',
  Tilde = 'TILDE',
  Traverse = 'TRAVERSE'
}

export type ValueMetadata = {
  __typename?: 'ValueMetadata';
  isReference?: Maybe<Scalars['Boolean']>;
  type?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type YamlLineLocation = {
  __typename?: 'YamlLineLocation';
  end?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
};
