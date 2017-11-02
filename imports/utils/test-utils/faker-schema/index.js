import jsf from 'json-schema-faker';
import { Approval, Credential, UserProfile, User } from './User';
import { Tag } from './Tag';
export const fakerSchema = {
  generateDoc: jsf,
  schema: {
    Tag,
    Approval,
    Credential,
    UserProfile,
    User
  }
}