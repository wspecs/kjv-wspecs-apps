import {handlerDecorator} from './../lib/router-config';
import {KJV} from './../models';
import {AppRequest, AppResponse} from '../lib/types'
import {appDetails} from './config'
import {serverConfig} from './../lib/server-config';
import * as books from './books';
import {BasicRoutes} from './router'


const ERROR_MESSAGE = 'Oops, the page you\'re looking for is missing.';

class KJVRoutes extends BasicRoutes {

  constructor() {
    const basePath = '';
    super(basePath);
  }

  private getBookName(number) {
    if (number < 1 || number > 66) {
      throw new Error('number out of range');
    }
    return books.names[number- 1][0];
  }

  private getBookNumber(name) {
    const search = name.toLowerCase().replace(/[^a-z0-9]+/, '');
    for (let idx = 0; idx < books.names.length; idx++) {
      if (books.names[idx].some(x => x.toLowerCase() === search)) {
        return idx + 1;
      }
    }
    return -1;
  }

  /**
   * Compute if a book in the bible only has one chapter. Here are the books
   * with one chapter. 
   * - Obadiah
   * - Philemon
   * - 2 John
   * - 3 John
   * - Jude
   */
  private hasOneChapter(bookIndex: number) {
    return [31, 57, 63, 64, 65].some(x => x === bookIndex);
  }

  @handlerDecorator
  searchPage(req, res) {
    const query = (req.params.query || '').trim();
    const start = Number(req.params.start) || 0;
    return KJV.find(
        {$text: {$search: query}},
        {score: {$meta: 'textScore'}})
      .sort({score:{$meta:'textScore'}})
      .skip(start)
      .limit(20)
      .exec().then(docs => {
        const page = {
          results: docs.map(x => {
            x.bookName = this.getBookName(x.book);
            return x;
          }),
          pageContent: 'results',
        }
        this.renderLayout(page, res.cache);
      });
  };


  @handlerDecorator
  versePage(req, res) {
    const query = {
      book: Number(req.params.book) || this.getBookNumber(req.params.book),
      chapter: req.params.chapter,
      verse: req.params.verse,
    };
    return KJV.find(query).sort('verse').exec().then(verses => {
      const page = {
        pageContent: 'chapter',
        verses,
        book: this.getBookName(verses[0].book),
      }
      this.renderLayout(page, res.cache);
    })
  };

  @handlerDecorator
  chapterPage(req, res) {
    const query = {
      book: Number(req.params.book) || this.getBookNumber(req.params.book),
      chapter: req.params.chapter,
    };

    if (this.hasOneChapter(query.book) && Number(query.chapter) > 1) {
      this.redirect(res, `${req.params.book}/1/${query.chapter}`);
      return;
    }
    return KJV.find(query).sort('verse').exec().then(verses => {
      const page = {
        pageContent: 'chapter',
        verses,
        book: this.getBookName(verses[0].book),
      }
      this.renderLayout(page, res.cache);
    })
  };

  @handlerDecorator
  bookPage(req, res) {
    const bookIndex = Number(req.params.book) || this.getBookNumber(
      req.params.book);
    const bookName = this.getBookName(bookIndex);

    if (this.hasOneChapter(bookIndex)) {
      this.redirect(res, `${req.params.book}/1`);
      return;
    }

    const page = {
      bookIndex,
      bookName,
      chapterCount: books.chapterCount[bookIndex - 1],
      pageContent: 'book',
    }
    this.renderLayout(page, res.cache);
  };

  @handlerDecorator
  homePage(req, res) {
    const page = {
      pageContent: 'home',
      books: books.names.map(x => x[0]),
    }
    this.renderLayout(page, res.cache);
  };

  get() {
    this.router.get('/search/:query/:start', this.searchPage.bind(this));
    this.router.get('/search/:query', this.searchPage.bind(this));
    this.router.get('/:book/:chapter/:verse', this.versePage.bind(this));
    this.router.get('/:book/:chapter', this.chapterPage.bind(this));
    this.router.get('/:book', this.bookPage.bind(this));
    this.router.get('/', this.homePage.bind(this));
    return super.get();
  }
}

export const routes = new KJVRoutes().get();
