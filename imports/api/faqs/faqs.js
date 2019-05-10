FAQs = new SimpleSchema({
  _id: {
    type: String,
    optional: false
  },
  lang: {
    type: String,
    optional: true,
    allowedValues: ['en','ja','se','cy'],
    defaultValue: 'en'
  },
  question: {
    type: String,
    optional: true,
  },
  answer: {
    type: String,
    optional: true,
  },
  userId: {
    type: String,
    optional: false
  }
});
