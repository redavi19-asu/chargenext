# ChargeNext + Urban Carrier OS integration

ChargeNext is the customer-facing EV service experience. Urban Carrier OS is the operations layer behind the business.

## Intended production flow

1. Customer opens ChargeNext and submits an emergency charging request.
2. ChargeNext captures/validates location and completes the existing payment/verification flow.
3. Once the request is verified, ChargeNext prepares a normalized Urban Carrier OS intake payload.
4. A secure server-side intake endpoint validates the request and creates the ChargeNext job inside Urban Carrier OS.
5. The ChargeNext dispatcher sees the job in the Dispatcher app.
6. An eligible online ChargeNext driver is assigned.
7. Driver status updates feed the customer tracking/status experience.

## Frontend bridge already prepared

`src/lib/dispatchos-bridge.ts` maps a verified ChargeNext emergency request into a Urban Carrier OS-ready payload.

`src/lib/emergency-flow.ts` calls that bridge whenever a verified request is saved.

The bridge is intentionally a safe no-op until this environment variable is configured:

`NEXT_PUBLIC_DISPATCHOS_INTAKE_URL`

No Urban Carrier OS secret belongs in the browser. The configured URL must be a server-side/public-intake endpoint that performs its own validation, tenant resolution, idempotency/rate limiting, and job creation.

## Security rule

Do not point the browser directly at a privileged Urban Carrier OS job-creation endpoint and do not place an API secret in a `NEXT_PUBLIC_*` variable. The final production connection should pass through a server-side worker that verifies the ChargeNext request before creating the Urban Carrier OS job.

## ChargeNext tenant

Urban Carrier OS company slug for this integration: `chargenext`.

This makes ChargeNext the first real customer/example implementation of Urban Carrier OS rather than a fake demo company.
