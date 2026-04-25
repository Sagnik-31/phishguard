import type { DemoEmail } from "./types";

export const demoEmails: DemoEmail[] = [
  {
    id: "paypal-password-reset",
    label: "PayPal password reset",
    content: `From: PayPal Security <support@paypa1-security.com>
To: alex@example.com
Subject: Immediate password reset required
Date: Sat, 25 Apr 2026 08:14:00 +0000
Reply-To: verification@paypa1-security.com
Message-ID: <reset-88421@paypa1-security.com>

Dear PayPal customer,

We detected unusual activity on your account from a new device.
For your protection, your account access has been temporarily limited.
You must verify your password within 24 hours to avoid permanent suspension.

Secure your account here:
https://paypa1-security.com/login/verify

You can also review your case details:
https://paypa1-security.com/account-review

Failure to complete this verification will restrict all transfers.

Thank you,
PayPal Account Security Team`,
  },
  {
    id: "google-drive-share",
    label: "Google Drive share",
    content: `From: Google Drive <drive-shares@googleworkspace-alerts.com>
To: jordan@example.com
Subject: Morgan shared "Q2 Compensation Review" with you
Date: Sat, 25 Apr 2026 09:22:00 +0000
Reply-To: noreply@googleworkspace-alerts.com
Message-ID: <share-19022@googleworkspace-alerts.com>

Morgan has shared a protected document with you on Google Drive.

File name: Q2 Compensation Review.pdf
Permission: Viewer
Expiration: Today at 6:00 PM

Open the file:
https://bit.ly/gdrive-q2-review-44

If the link does not open, copy and paste this address:
https://bit.ly/gdrive-secure-view

This document may contain confidential information.
Do not forward this notification outside your organization.

Google Drive Notifications`,
  },
  {
    id: "bank-account-suspension",
    label: "Bank account suspension",
    content: `From: First National Bank <security@firstnational-alerts.net>
To: taylor@example.com
Subject: Final notice: account suspension pending
Date: Sat, 25 Apr 2026 10:03:00 +0000
Reply-To: support@firstnational-alerts.net
Message-ID: <case-772901@firstnational-alerts.net>

Dear customer,

Your online banking profile has failed our latest security review.
We have placed a temporary hold on outgoing payments.
To avoid full account suspension, verify your identity immediately.

Verification portal:
https://firstnational-alerts.net/secure/identity

You will need your username, password, and one-time passcode.
This process must be completed within 2 hours.

If you ignore this notice, access to your account may be revoked.

Security Operations
First National Bank`,
  },
  {
    id: "hr-payroll-spoof",
    label: "HR payroll spoof",
    content: `From: Acme HR Payroll <hr-payroll@acme-benefits.co>
To: employee@acme.com
Subject: Action required: payroll profile update
Date: Sat, 25 Apr 2026 11:18:00 +0000
Reply-To: payroll-update@acme-benefits.co
Message-ID: <payroll-2026-441@acme-benefits.co>

Hello,

As part of the payroll migration, all employees must confirm payment details.
Please update your direct deposit and tax withholding profile before 5 PM today.
Employees who do not complete the update may experience delayed salary processing.

Payroll update form:
https://acme-benefits.co/payroll/update

Use your company email address to sign in.
Do not contact your manager until the update is complete.

Regards,
Human Resources
Acme Corporation`,
  },
  {
    id: "aws-billing-legit",
    label: "AWS billing notification",
    content: `From: AWS Billing <no-reply-aws@amazon.com>
To: cloud-admin@example.com
Subject: Your AWS invoice is now available
Date: Sat, 25 Apr 2026 12:04:00 +0000
Reply-To: no-reply-aws@amazon.com
Message-ID: <invoice-20260425@amazon.com>

Hello,

Your AWS invoice for the current billing period is now available.
You can view your bill in the AWS Billing and Cost Management console.

Console link:
https://console.aws.amazon.com/billing/home

This notification is informational only.
AWS will never ask for your password or multi-factor authentication code by email.

If you have questions, open a support case from the AWS console.

Thank you,
Amazon Web Services`,
  },
];
