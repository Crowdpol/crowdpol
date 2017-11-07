import jsf from 'json-schema-faker';
import { Approval, Credential, UserProfile, User } from './User';
import { Tag } from './Tag';
import { Proposal } from './Proposal';
import { Comment } from './Comment';
export const fakerSchema = {
  generateDoc: jsf,
  schema: {
  	Proposal,
  	Comment,
    Tag,
    Approval,
    Credential,
    UserProfile,
    User
  }
}