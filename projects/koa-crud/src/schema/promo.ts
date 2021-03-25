import { gql } from 'apollo-server-koa';

export const typeDefs = gql`
  enum PromoTemplate {
    DEPOSIT
    SIGN_UP
  }

  enum PromoStatus {
    DRAFT
    ACTIVE
    INACTIVE
  }

  enum MemberFields {
    EMAIL
    REAL_NAME
    BANK_ACCOUNT
  }

  interface Promo {
    id: ID!
    name: String!
    template: PromoTemplate!
    title: String!
    description: String!
    submitted: Boolean!
    enabled: Boolean!
    status: PromoStatus!
    createdAt: String!
    updatedAt: String
  }

  type DepositPromo implements Promo {
    id: ID!
    name: String!
    template: PromoTemplate!
    title: String!
    description: String!
    submitted: Boolean!
    enabled: Boolean!
    status: PromoStatus!
    minimumBalance: Float!
    createdAt: String!
    updatedAt: String
  }

  type SignUpPromo implements Promo {
    id: ID!
    name: String!
    template: PromoTemplate!
    title: String!
    description: String!
    submitted: Boolean!
    enabled: Boolean!
    status: PromoStatus!
    requiredMemberFields: [MemberFields!]
    createdAt: String!
    updatedAt: String
  }

  type PromoEdge {
    node: Promo
    cursor: String
  }

  type PromoPageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type PromoConnection {
    totalCount: Int
    edges: [PromoEdge]!
    pageInfo: PromoPageInfo
  }

  input PromoQueryOperatorInput {
    eq: String
    gt: Float
    gte: Float
  }

  input PromoFilterInput {
    name: PromoQueryOperatorInput
    template: PromoQueryOperatorInput
    title: PromoQueryOperatorInput
    description: PromoQueryOperatorInput
    status: PromoQueryOperatorInput
    minimumBalance: PromoQueryOperatorInput
  }

  extend type Query {
    promos(limit: Int, after: String, filter: PromoFilterInput): PromoConnection
    promo(id: ID!): Promo
  }

  input CreatePromoInput {
    name: String!
    template: PromoTemplate!
    title: String!
    description: String!
    submitted: Boolean
    enabled: Boolean
    status: PromoStatus
    minimumBalance: Float
    requiredMemberFields: [String]
  }

  input UpdatePromoInput {
    name: String!
    template: PromoTemplate!
    title: String!
    description: String!
    submitted: Boolean
    enabled: Boolean
    status: PromoStatus
    minimumBalance: Float
    requiredMemberFields: [String]
  }

  extend type Mutation {
    createPromo(input: CreatePromoInput!): Boolean!
    updatePromo(id: ID!, input: UpdatePromoInput!): Boolean!
    deletePromo(id: ID!): Boolean!
  }
`;
