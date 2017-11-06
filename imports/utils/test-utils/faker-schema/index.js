import jsf from 'json-schema-faker';
import { Approval, Credential, UserProfile, User } from './User';
import { Tag } from './Tag';
import { Proposal } from './Proposal';
export const fakerSchema = {
  generateDoc: jsf,
  schema: {
  	Proposal,
    Tag,
    Approval,
    Credential,
    UserProfile,
    User
  }
}