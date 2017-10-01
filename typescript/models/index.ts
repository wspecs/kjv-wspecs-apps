import {Document} from 'mongoose'
import {mongoose} from './../lib/database';

export interface IKJV extends Document {
  book: number;
  bookName?: string;
  chapter: number;
  verse: number;
  text: string;
}

const MODEL_NAME = 'KJV';

let schema = new mongoose.Schema({
  book: {
    type: Number,
    required: true,
  },
  chapter: {
    type: Number,
    required: true,
  },
  verse: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

schema.index(
    {text: 'text'},
    {"weights": { text: 1}}
)

export const KJV = mongoose.model<IKJV>(MODEL_NAME, schema);
