import { gql } from 'apollo-server-koa';

export const typeDefs = gql`
  enum VendorType {
    SEAMLESS
    TRANSFER
  }

  type Vendor {
    id: ID!
    name: String!
    type: VendorType!
    createdAt: String!
    updatedAt: String
  }

  type VendorEdge {
    node: Vendor
    cursor: String
  }

  type VendorPageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type VendorConnection {
    totalCount: Int
    edges: [VendorEdge]
    pageInfo: VendorPageInfo
  }

  input StringQueryOperatorInput {
    eq: String
  }

  input VendorFilterInput {
    name: StringQueryOperatorInput
    type: StringQueryOperatorInput
  }

  extend type Query {
    vendors(
      limit: Int
      after: String
      filter: VendorFilterInput
    ): VendorConnection
    vendor(id: ID!): Vendor
  }

  input CreateVendorInput {
    name: String!
    type: VendorType!
  }

  input UpdateVendorInput {
    name: String
    type: VendorType
  }

  extend type Mutation {
    createVendor(input: CreateVendorInput!): Boolean
    updateVendor(id: ID!, input: UpdateVendorInput!): Boolean
    deleteVendor(id: ID!): Boolean
  }
`;
