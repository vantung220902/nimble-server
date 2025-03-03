import { AppConfig } from '@config';
import { EmailService } from '@email/services/email.service';
import { Test } from '@nestjs/testing';
import SendGrid from '@sendgrid/mail';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let appConfig: jest.MockedObject<AppConfig>;

  beforeEach(async () => {
    appConfig = {
      sendGridApiKey: 'api-key',
      emailForm: 'example@gmail.com',
    } as jest.MockedObject<AppConfig>;

    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: AppConfig,
          useValue: appConfig,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email using SendGrid', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Nimble',
        html: '<p>Nimble</p>',
      };

      await service.sendEmail(emailOptions);

      expect(SendGrid.setApiKey).toHaveBeenCalledWith('api-key');
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

    it('should throw error if SendGrid fails', async () => {
      const error = new Error('SendGrid error');
      (SendGrid.send as jest.Mock).mockRejectedValueOnce(error);

      const emailOptions = {
        to: 'test@example.com',
        subject: 'Nimble',
        html: '<p>Nimble</p>',
      };

      await expect(service.sendEmail(emailOptions)).rejects.toThrow(error);
    });
  });

  describe('generateVerificationTemplate', () => {
    it('should generate correct verification email template', () => {
      const payload = {
        firstName: 'Test',
        lastName: 'Test',
        code: '123456',
        link: 'http://web.app.com/verify',
      };

      const template = service.generateVerificationTemplate(payload);

      expect(template).toContain(`Hi ${payload.firstName} ${payload.lastName}`);
      expect(template).toContain(payload.code);
      expect(template).toContain(payload.link);
    });

    it('should handle empty payload values', () => {
      const payload = {
        firstName: '',
        lastName: '',
        code: '',
        link: '',
      };

      const template = service.generateVerificationTemplate(payload);

      expect(template).toContain('Hi  ,');
      expect(template).toMatch(/<a href="">Verify Account<\/a>/);
    });
  });
});
