import { AppConfig } from '@config';
import { Injectable } from '@nestjs/common';
import { SendHtmlEmailOptions } from '../interfaces';
import SendGrid, { MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private readonly appConfig: AppConfig) {}

  public async sendEmail(options: SendHtmlEmailOptions): Promise<void> {
    SendGrid.setApiKey(this.appConfig.sendGridApiKey);

    const msg: MailDataRequired = {
      to: options.to,
      from: this.appConfig.emailForm,
      subject: options.subject,
      html: options.html,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false,
        },
        subscriptionTracking: {
          enable: false,
        },
      },
    };

    await SendGrid.send(msg);
  }

  public generateVerificationTemplate(payload: {
    firstName: string;
    lastName: string;
    code: string;
    link: string;
  }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto;">
      <div style="padding: 20px; border-bottom: 2px solid #4a86e8;">
        <h2>Email Verification</h2>
      </div>
      
      <div style="padding: 20px;">
        <p>Hi ${payload.firstName} ${payload.lastName},</p>
        <p>Please use the verification code below to complete your registration:</p>
        
        <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f5f5f5;">${payload.code}</p>
        
        <p>Or click this link to verify your account: <a href="${payload.link}">Verify Account</a></p>
        
        <p>This code will expire in 3 minutes.</p>
        
        <p>Regards,<br>Nimble Code Challenge</p>
      </div>
    </body>
    </html>
    `;
  }
}
