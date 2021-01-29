# API Documentation

#### Backend delpoyed at [Heroku](https://ezinvoice.herokuapp.com/) <br>

## Getting started

To get the server running locally:

-   Clone this repo
-   **npm install** to install all required dependencies
-   **npm run start** to start the local server
-   **npm run tests** to start server using testing environment

### Backend Framework

-   ExpressJS
-   Knex
-   PostgreSQL

## Endpoints

#### User Routes

| Method | Endpoint          | Access Control | Description                         |
| ------ | ----------------- | -------------- | ----------------------------------- |
| GET    | `/users/`         | authentication | Return info for the logged in user. |
| GET    | `/users/:user_id` | owners         | Return info for a single user.      |
| PUT    | `/users/:user_id` | owners         | Return an updated single user       |
| DELETE | `/users/:user_id` | owners         | Delete a single user                |

<br>

#### User Settings Routes

| Method | Endpoint     | Access Control | Description                                          |
| ------ | ------------ | -------------- | ---------------------------------------------------- |
| POST   | `/settings/` | authentication | Create and return user setting for the current user. |
| GET    | `/settings/` | owners         | Return info for a single user setting                |
| PUT    | `/settings/` | owners         | Return an updated single user setting                |
| DELETE | `/settings/` | owners         | Delete a single user setting                         |

<br>

#### Clients Routes

| Method | Endpoint              | Access Control | Description                                      |
| ------ | --------------------- | -------------- | ------------------------------------------------ |
| POST   | `/clients/`           | authentication | Create and return a client for the current user. |
| GET    | `/clients/`           | owners         | Return info for an array of clients              |
| PUT    | `/clients/:client_id` | owners         | Return an updated client                         |
| DELETE | `/clients/:client_id` | owners         | Delete a single client                           |

<br>

#### Businesses Routes

| Method | Endpoint                   | Access Control | Description                                        |
| ------ | -------------------------- | -------------- | -------------------------------------------------- |
| POST   | `/businesses/`             | authentication | Create and return a business for the current user. |
| GET    | `/businesses/`             | owners         | Return info for an array of businesses             |
| PUT    | `/businesses/:business_id` | owners         | Return an updated business                         |
| DELETE | `/businesses/:business_id` | owners         | Delete a single business                           |

<br>

#### Items Routes

| Method | Endpoint          | Access Control | Description                                    |
| ------ | ----------------- | -------------- | ---------------------------------------------- |
| POST   | `/items/`         | authentication | Create and return a item for the current user. |
| GET    | `/items/`         | owners         | Return info for an array of items              |
| PUT    | `/items/:item_id` | owners         | Return an updated item                         |
| DELETE | `/items/:item_id` | owners         | Delete a single item                           |

<br>

#### Invoices Routes

| Method | Endpoint                | Access Control | Description                                       |
| ------ | ----------------------- | -------------- | ------------------------------------------------- |
| POST   | `/invoices/`            | authentication | Create and return a invoice for the current user. |
| GET    | `/invoices/`            | owners         | Return info for an array of invoices              |
| PUT    | `/invoices/:invoice_id` | owners         | Return an updated invoice                         |
| DELETE | `/invoices/:invoice_id` | owners         | Delete a single invoice                           |

<br>

#### Estimates Routes

| Method | Endpoint                  | Access Control | Description                                        |
| ------ | ------------------------- | -------------- | -------------------------------------------------- |
| POST   | `/estimates/`             | authentication | Create and return a estimate for the current user. |
| GET    | `/estimates/`             | owners         | Return info for an array of estimates              |
| PUT    | `/estimates/:estimate_id` | owners         | Return an updated estimate                         |
| DELETE | `/estimates/:estimate_id` | owners         | Delete a single estimate                           |

# Data Model

#### USERS

---

```
{
  id: BIGINT
  name: STRING
  email: STRING
  picture: STRING
  sub: STRING
}
```

---

#### USER SETTINGS

---

```
{
  id: BIGINT
  name: STRING
  email: STRING
  street: STRING
  city_state: STRING
  zip: STRING
  phone: STRING
  user_id: BIGINT
}
```

---

#### CLIENTS

---

```
{
  id: STRING
  name: STRING
  email: STRING
  street: STRING
  city_state: STRING
  zip: STRING
  phone: STRING
  user_id: BIGINT
}
```

---

#### BUSINESSES

---

```
{
  id: STRING
  name: STRING
  email: STRING
  street: STRING
  city_state: STRING
  zip: STRING
  phone: STRING
  user_id: BIGINT
  is_hidden: BOOLEAN
}
```

---

#### ITEMS

---

```
{
  id: BIGINT
  description: STRING
  rate: FLOAT
  user_id: BIGINT
}
```

---

#### INVOICES

---

```
{
  id: BIGINT
  title: STRING
  doc_number: STRING
  user_id: BIGINT
  business_id: BIGINT
  client_id: BIGINT
  is_paid: BOOLEAN
  notes: STRING
  items: ARRAY of Items: {
    id: BIGINT
    description: STRING
    rate: FLOAT
    quantity: INTEGER
    user_id: BIGINT
  }

}
```

---

#### ESTIMATES

---

```
{
  id: BIGINT
  title: STRING
  doc_number: STRING
  user_id: BIGINT
  business_id: BIGINT
  client_id: BIGINT
  is_paid: BOOLEAN
  notes: STRING
  items: ARRAY of Items: {
    id: BIGINT
    description: STRING
    rate: FLOAT
    quantity: INTEGER
    user_id: BIGINT
  }

}
```

---

## Environment Variables

In order for the app to function correctly, the user must set up their own environment variables.

create a .env file that includes the following:

    *  PORT - port used for localhost development
    *  APP_CLIENT_ID - Auth0 application client id for jwt verification purpose
    *  AUTH0_DOMAIN - Auth0 developer domain for jwt verification purpose
    *  DATABASE_URL - database url e.g. postgres://dbusername:dbuserpassword@host/dbname

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](./code_of_conduct.md). Please follow it in all your interactions with the project.

### Issue/Bug Request

**If you are having an issue with the existing project code, please submit a bug report under the following guidelines:**

-   Check first to see if your issue has already been reported.
-   Check to see if the issue has recently been fixed by attempting to reproduce the issue using the latest master branch in the repository.
-   Create a live example of the problem.
-   Submit a detailed bug report including your environment & browser, steps to reproduce the issue, actual and expected outcomes, where you believe the issue is originating from, and any potential solutions you have considered.

### Feature Requests

We would love to hear from you about new features which would improve this app and further the aims of our project. Please provide as much detail and information as possible to show us why you think your new feature should be implemented.

### Pull Requests

If you have developed a patch, bug fix, or new feature that would improve this app, please submit a pull request. It is best to communicate your ideas with the developers first before investing a great deal of time into a pull request to ensure that it will mesh smoothly with the project.

Remember that this project is licensed under the MIT license, and by submitting a pull request, you agree that your work will be, too.

#### Pull Request Guidelines

-   Ensure any install or build dependencies are removed before the end of the layer when doing a build.
-   Update the README.md with details of changes to the interface, including new plist variables, exposed ports, useful file locations and container parameters.
-   Ensure that your code conforms to our existing code conventions and test coverage.
-   Include the relevant issue number, if applicable.
-   You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

### Attribution

These contribution guidelines have been adapted from [this good-Contributing.md-template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).

## Documentation

See [Frontend Documentation](https://github.com/jiayi-ren/ezinvoice-frontend) for details on the fronend of the project.
