export interface SendHtmlEmailOptions {
  to: string | string[];
  html: string;
  subject: string;
  context?: unknown;
}
