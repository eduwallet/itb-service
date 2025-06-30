# ITB Service

This is a service to link the EduWallet issuer with the Interoperability Test Board (ITB) for the DIIPv4 specification.

## HTTP Service

This service offers an HTTP endpoint at `PORT` and `LISTEN_ADDRESS` as configured in the `.env` environment file. This interface listens to the following endpoints:

- `credentialIssuanceRequest`

## Configuration

Configurations for the various test credentials reside in the `/conf` path. This can be set using the `CONF_DIR` environment variable.

Each configuration has the following attributes:

- `name` which should be the same as the file name without extension
- `description` for internal purposes
- `url` the full agent url to retrieve a new credential offer
- `token` the agent token required for this test
- `data` the POST data that should be sent along

