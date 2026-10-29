# Retrieval failure and retry presentation

`@mailboost/erpboost-ui/retry-notice` exports RetryNotice, composing unchanged Alert and Button components. The caller supplies error children, retryLabel, onRetry, retrying and optional retryDisabled. It performs no data access, error parsing or automatic retries. Retry uses a native type=button so it does not submit an enclosing form, and pending/disabled states block the action.

Long errors wrap and scroll in a keyboard-focusable message area, keeping the retry action outside that scroll region. Text remains escaped by React; the pending icon respects reduced motion. A caller can provide role=group where an outer error region already announces the failure.

ERPBoost uses it for 15 retrieval-failure locations: organization and connection context, connection forms/API-key choices, member/secret lists, DB and sync catalogues, pipeline list/picker, order project/list/record/history. Queries, cache state, permissions, draft values, API calls and mutations remain in the app. Previously missing retry actions are added to DB, order and member lists.

Verification covers native parent-form isolation, controlled pending/failure/success, exact draft strings, escaped long errors, keyboard scrolling and compact layouts. Existing source components/styles remain unchanged; the root index appends one export. This does not verify live persistence or deployments.
