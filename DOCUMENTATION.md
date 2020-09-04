This bundle helps you connect to your favorite (swapable) transporter and render react templates as email. It is thought to work with typescript and enjoy type-safety.

## Installation

```bash
npm install @kaviar/email-bundle react react-dom
```

# Email Bundle

```typescript
new KaviarEmailBundle(config);

// The config interface:
export interface IEmailBundleConfig {
  transporter?:
    | Transport
    | {
        host: string;
        port: number;
        secure?: boolean;
        auth?: {
          user: string;
          pass: string;
        };
      };
  defaults: IEmailBundleConfigDefaults;
}

// Ability to override
export interface IEmailBundleConfigDefaults {
  // Default is: "KAVIAR" <no-reply@kaviarjs.org>
  from?: string;

  // Properties that will always reach any email
  // For example you may want to store here the Application's BASE URL
  props?: object;
}
```

In most cases you would simply use it by connecting to your SMTP provider:

```typescript
new KaviarEmailBundle({
  transport: {
    host: "xxx",
    port: 25,
    auth: {
      user: "xxx",
      pass: "***",
    },
  },
});
```

If you leave it blank, it will default to an ethereal test account, and it will let you view the email on the web.

You can use it by either providing your own custom transport, you can customise this heavily.

```typescript
import * as mg from "nodemailer-mailgun-transport";

new KaviarEmailBundle({
  transporter: mg({
    auth: {
      api_key: "xxx",
      domain: "mydomain.com",
    },
  }),
});
```

Read more here:

- https://nodemailer.com/transports/
- https://nodemailer.com/plugins/create/#transports

And if you want to have a registered, service-dependency container that creates the transport inside your bundle, then, in the `hook()` phase, listen to `BundleBeforePrepareEvent` and `setTransporter()` with your own custom transport solution. Same logic would apply if you want to extend the global props (props that reach any email template).

## Usage

```typescript
// https://nodemailer.com/about/
const emailService = this.get<EmailService>(EmailService);

export interface IWelcomeEmailProps {
  name: string;
}

// To send your email is easy
export const WelcomeEmail = (props: IWelcomeEmailProps) => {
  return <div>Hello {props.name}</div>;
};

WelcomeEmail.subject = (props: IWelcomeEmailProps) => `Hello ${props.name}`;

// The send argument IWelcomeEmailProps is optional, but it does help you ensure props is correctly sent
await emailService.send<IWelcomeEmailProps>(
  // Template options
  {
    component: MyEmailTemplate,
    props: {
      name: "Theodor",
    },
  },
  {
    to: "someone@somewhere.com",
    from: "theo@kaviarjs.org", // optional, most likely you will miss and let it be the default one
  }
);
```

## Responsive Emails

You can use https://mjml.io/ to benefit of nicely rendered emails.

```bash
npm install mjml
```

Let's hook into it right before sending so we can transform our html:

```typescript
import { Listener, On } from "@kaviar/core";
import * as mjml2html from "mjml";

class EmailListener extends Listener {
  @On(EmailBeforeSendEvent)
  transformMjml(event: EmailBeforeSendEvent) {
    const { html } = event.data.mailOptions;
    event.data.mailOptions.html = mjml2html(html);
  }
}
```

Another alternative would be to use the react version of it: https://github.com/wix-incubator/mjml-react and bypass the need of a listener.

## Global Variables

Following the same pattern as above, you can listen to emails before they get rendered via `EmailBeforeRenderEvent` and inject a variable such as "applicationUrl" or a router:

```ts
class EmailListener extends Listener {
  @On(EmailBeforeRenderEvent)
  extendProps(event: EmailBeforeRenderEvent) {
    const { emailTemplate } = event.data;

    Object.assign(emailTemplate.props, {
      appUrl: "http://www.google.com",
    });
  }
}
```

And you can have a sort of "master" interface for these global props:

```ts
export interface IGlobalEmailProps {
  appUrl: string;
}

export interface IWelcomeEmailProps {
  name: string;
}
```
