import jsf from 'json-schema-faker';
import { Approval, Credential, UserProfile, User } from './User';
import { Tag } from './Tag';
import { Proposal } from './Proposal';
import { Comment } from './Comment';
import { Rank } from './Rank';
import { Vote } from './Vote';
import { DelegateVote } from './DelegateVote';
export const fakerSchema = {
  generateDoc: jsf,
  schema: {
    Vote,
  	Proposal,
  	Comment,
    Tag,
    Rank,
    Approval,
    Credential,
    User,
    DelegateVote
  }
}