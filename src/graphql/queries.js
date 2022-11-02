/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getCustomerTech = /* GraphQL */ `
  query GetCustomerTech($id: ID!) {
    getCustomerTech(id: $id) {
      id
      username
      category
      assigned
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listCustomerTeches = /* GraphQL */ `
  query ListCustomerTeches(
    $filter: ModelcustomerTechFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomerTeches(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        category
        assigned
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getCalEvent = /* GraphQL */ `
  query GetCalEvent($id: ID!) {
    getCalEvent(id: $id) {
      id
      name
      name2
      details
      start
      end
      time_of_day
      admin_notes
      emp_notes
      category
      color
      apt_num
      apt_status
      service_category
      owner2
      note_code
      created_by
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listCalEvents = /* GraphQL */ `
  query ListCalEvents(
    $filter: ModelcalEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCalEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        name2
        details
        start
        end
        time_of_day
        admin_notes
        emp_notes
        category
        color
        apt_num
        apt_status
        service_category
        owner2
        note_code
        created_by
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
