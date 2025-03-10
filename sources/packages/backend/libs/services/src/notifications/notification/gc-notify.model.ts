export interface GCNotifyResult {
  content: ContentPayload;
  id: string;
  reference: string;
  scheduled_for: string; //API payload require this naming convention, so we are not following camelCase.
  template: Template;
  uri: string;
}

export interface Template {
  id: string;
  uri: string;
  version: number;
}

export interface ContentPayload {
  body: string;
  from_email: string; //API payload require this naming convention, so we are not following camelCase.
  subject: number;
}

export interface RequestPayload<T> {
  email_address: string; //API payload require this naming convention, so we are not following camelCase.
  template_id: string; //API payload require this naming convention, so we are not following camelCase.
  personalisation: T;
}
