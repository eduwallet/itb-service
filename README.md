# ITB Service

This is a service to link the EduWallet issuer with the Interoperability Test Board (ITB) for the DIIPv4 specification.

The implementation follows basic guidelines set out in https://github.com/EWC-consortium/eudi-wallet-rfcs/blob/main/ewc-rfc100-interoperability-profile-towards-itb.md


## HTTP Service

This service offers an HTTP endpoint at `PORT` and `LISTEN_ADDRESS` as configured in the `.env` environment file. This interface listens to the following endpoints:

- `credentialIssuanceRequest`
- `issueStatus`

The `credentialIssuanceRequest` requires a query parameter `credentialType` that corresponds to one of the configured tests. It also requires a `sessionId` parameter that indicates the client side session.

E.g.:

```json
curl https://itb.dev.eduwallet.nl/credentialIssuance?credentialType=test1&sessionId=ab37a66a
```

The response is a JSON object as follows:

```json
{
    "sessionId": "<sessionId as passed in the call>",
    "deeplink": "<credential offer url>",
    "qr": "data:image/png;base64,<encoded QR image of the credential offer url>",
    "pin": "<optional transaction code as used in the test>"
}
```

The `issueStatus` request has a single `sessionId` query parameter that needs to match an earlier session. The response looks like:

```json
{
    "sessionId": "<sessionId as passed in the call>",
    "status": "fail|pending|success",
    "reason": "unknown|ok|<relevant status reason>"
}
```

## Configuration

Configurations for the various test credentials reside in the `/conf` path. This can be set using the `CONF_DIR` environment variable.

Each configuration has the following attributes:

- `name` which should be the same as the file name without extension
- `description` for internal purposes
- `url` the full agent url to retrieve a new credential offer
- `token` the agent token required for this test
- `data` the POST data that should be sent along
- `txcode` the transaction code, if any, that is used during the transaction. This is returned as the `pin` attribute in the credentialIssuance response.

