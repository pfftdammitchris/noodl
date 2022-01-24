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
  JSON: any;
  JSONObject: any;
};

export type ActionObjectMetadata = {
  __typename?: 'ActionObjectMetadata';
  actionType: Scalars['String'];
  isReference?: Maybe<Scalars['Boolean']>;
  trigger?: Maybe<Scalars['String']>;
};

export type PropertyMetadata = {
  __typename?: 'PropertyMetadata';
  isReference: Scalars['Boolean'];
  value?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  metadata?: Maybe<Scalars['JSON']>;
};

export enum ReferenceKind {
  Await = 'AWAIT',
  Eval = 'EVAL',
  Merge = 'MERGE',
  Tilde = 'TILDE',
  Traverse = 'TRAVERSE'
}

export type ReferenceKindMetadata = {
  __typename?: 'ReferenceKindMetadata';
  kind?: Maybe<ReferenceKind>;
};

export type ReferenceObjectBuiltIn = {
  __typename?: 'ReferenceObjectBuiltIn';
  group?: Maybe<Scalars['String']>;
  kind?: Maybe<ReferenceKind>;
  name?: Maybe<Scalars['String']>;
};

export type ReferencePropertyMetadata = {
  __typename?: 'ReferencePropertyMetadata';
  isRoot?: Maybe<Scalars['Boolean']>;
  kind: ReferenceKind;
  value?: Maybe<Scalars['String']>;
};

export type ReferenceStringMetadata = {
  __typename?: 'ReferenceStringMetadata';
  isRoot?: Maybe<Scalars['Boolean']>;
  kind?: Maybe<ReferenceKind>;
  value: Scalars['String'];
};
