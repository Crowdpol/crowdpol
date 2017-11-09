import jsf from 'json-schema-faker';
import { Approval, Credential, UserProfile, User } from './User';
import { Tag } from './Tag';
import { Proposal } from './Proposal';
import { Comment } from './Comment';
import { Rank } from './Rank';
export const fakerSchema = {
  generateDoc: jsf,
  schema: {
  	Proposal,
  	Comment,
    Tag,
    Rank,
    Approval,
    Credential,
    User
  }
}