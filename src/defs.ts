import React from "react";
import { Transport, SentMessageInfo } from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";

type SimpleObjectType = { [key: string]: any };

export interface IGlobalEmailProps {}

export interface IReactEmailTemplate<IProps = SimpleObjectType>
  extends React.FC<IProps & IGlobalEmailProps> {
  subject?: (props: IProps & IGlobalEmailProps) => string;
}

export interface ITransporter {
  sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
}

export interface IEmailSendingTemplateConfig<IProps = SimpleObjectType> {
  component: IReactEmailTemplate<IProps>;
  props?: IProps;
}

export interface IEmailBundleConfigDefaults {
  from?: string;
  props?: SimpleObjectType;
}

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
