import { AppConfig } from '@config';
import { SendHtmlEmailOptions } from '@email/interfaces';
import { EmailService } from '@email/services';
import { Test, TestingModule } from '@nestjs/testing';
import SendGrid from '@sendgrid/mail';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let appConfig: AppConfig;
  let moduleRef: TestingModule;

  const mockAppConfig = {
    sendGridApiKey: 'api-key',
    emailForm: 'example@gmail.com',
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    emailService = moduleRef.get<EmailService>(EmailService);
    appConfig = moduleRef.get<AppConfig>(AppConfig);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('sendEmail', () => {
    it('Should send email correctly', async () => {
      const emailOptions: SendHtmlEmailOptions = {
        to: 'test@example.com',
        subject: 'Nimble',
        html: '<p>Nimble</p>',
      };

      await emailService.sendEmail(emailOptions);

      expect(SendGrid.setApiKey).toHaveBeenCalledTimes(1);
      expect(SendGrid.setApiKey(appConfig.sendGridApiKey));

      expect(SendGrid.send).toHaveBeenCalledTimes(1);
      expect(SendGrid.send).toHaveBeenCalledWith({
        to: emailOptions.to,
        from: appConfig.emailForm,
        subject: emailOptions.subject,
        html: emailOptions.html,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false,
          },
          subscriptionTracking: {
            enable: false,
          },
        },
      });
    });

    it('Should throw error if SendGrid fails', async () => {
      (SendGrid.send as jest.Mock).mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      const emailOptions: SendHtmlEmailOptions = {
        to: 'test@example.com',
        subject: 'Nimble',
        html: '<p>Nimble</p>',
      };

      await expect(emailService.sendEmail(emailOptions)).rejects.toThrow(
        'Something wrong!',
      );
    });
  });

  describe('generateVerificationTemplate', () => {
    it('Should generate verification template correctly', () => {
      const payload = {
        firstName: 'Tung',
        lastName: 'Nguyen',
        code: '12345',
        link: 'http://web.app.com/verify',
      };

      const verificationTemplate =
        emailService.generateVerificationTemplate(payload);

      expect(verificationTemplate).toContain(payload.firstName);
      expect(verificationTemplate).toContain(payload.lastName);
      expect(verificationTemplate).toContain(payload.code);
      expect(verificationTemplate).toContain(payload.link);
      expect(verificationTemplate).toContain(
        `Hi ${payload.firstName} ${payload.lastName},`,
      );
    });

    it('Should handle on empty payload', () => {
      const payload = {
        firstName: '',
        lastName: '',
        code: '',
        link: '',
      };

      const verificationTemplate =
        emailService.generateVerificationTemplate(payload);

      expect(verificationTemplate).toContain(`Hi  ,`);
      expect(verificationTemplate).toContain(
        '<p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f5f5f5;"></p>',
      );
      expect(verificationTemplate).toContain('<a href="">Verify Account</a>');
    });
  });
});
