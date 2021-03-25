import { gql } from 'apollo-server-koa';

export const typeDefs = gql`
  enum PromoEnrollmentRequestStatus {
    PENDING
    REJECTED
    PROCESSING
    APPROVED
  }

  type PromoEnrollmentRequest {
    id: ID!
    promo: Promo!
    member: Member!
    status: PromoEnrollmentRequestStatus!
    createdAt: String!
    updatedAt: String
  }

  type PromoEnrollmentRequestEdge {
    node: PromoEnrollmentRequest
    cursor: String
  }

  type PromoEnrollmentRequestPageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type PromoEnrollmentRequestConnection {
    totalCount: Int
    edges: [PromoEnrollmentRequestEdge]!
    pageInfo: PromoEnrollmentRequestPageInfo
  }

  input PromoEnrollmentRequestQueryOperatorInput {
    eq: String
  }

  input PromoEnrollmentRequestFilterInput {
    status: PromoEnrollmentRequestQueryOperatorInput
  }

  extend type Query {
    promoEnrollmentRequests(
      limit: Int
      after: String
      filter: PromoEnrollmentRequestFilterInput
    ): PromoEnrollmentRequestConnection
    promoEnrollmentRequest(id: ID!): PromoEnrollmentRequest
  }

  extend type Mutation {
    enrollToPromo(promo: ID!): Boolean!
    processPromoEnrollmentRequest(id: ID!): Boolean!
    approvePromoEnrollmentRequest(id: ID!): Boolean!
    rejectPromoEnrollmentRequest(id: ID!): Boolean!
  }
`;
