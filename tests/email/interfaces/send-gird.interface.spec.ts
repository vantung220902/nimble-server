import { SendHtmlEmailOptions } from '@email/interfaces';

describe('SendHtmlEmailOptions', () => {
  it('Should initialize SendHtmlEmailOptions correctly', () => {
    const emailOptions: SendHtmlEmailOptions = {
      to: 'test@gmail.com',
      html: '<p>Nimble</p>',
      subject: 'Test email',
    };

    expect(emailOptions).toBeDefined();
    expect(emailOptions.to).toEqual(emailOptions.to);
    expect(emailOptions.html).toEqual(emailOptions.html);
    expect(emailOptions.subject).toEqual(emailOptions.subject);
  });
});
