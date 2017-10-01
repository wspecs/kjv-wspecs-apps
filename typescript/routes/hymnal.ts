import {Router} from 'express';
import {handlerDecorator} from './../lib/router-config';
import {AppRequest, AppResponse} from './../lib/types'
import {chunk} from './../lib/utils';
import {serverConfig} from './../lib/server-config';
const removeAccents = require('remove-accents');
import {BasicRoutes} from './router'


const ERROR_MESSAGE = 'Oops, the page you\'re looking for is missing.';
const DEFAULT_CHAPTER = {title: '', number: ''};

export class HymnalRoutes extends BasicRoutes {

  private DB;
  private hymnalIndexes;

  constructor(basePath, database, hymnalIndexes, details={}) {
    super(basePath);
    this.DB = database;
    this.hymnalIndexes = hymnalIndexes;
    this.router.use((req: AppRequest, res, next) => {
      serverConfig.toc = hymnalIndexes;
      req.serverConfig = Object.assign({
        number: this.getCookie(req, 'num') || 1,
      }, serverConfig, details);
      next();
    });
  }

  private sortKey(a) {
    return removeAccents(a.title)
      .replace(/ /g, '').replace(/\W/g, '').toLowerCase();
  }

  private validSongNumber(n) {
    return !isNaN(n) && n >= 1 && n <= 654;
  }

  private toSong(doc) {
    const song = doc.toObject();
    song.prev = song.number > 1 ? song.number - 1 : 0;
    song.next = song.number < 654 ? song.number + 1 : 0;
    song.chunk = chunk;
    song.pageContent = 'song';
    return song;
  }

  slidesPage(req, res) {
    const number = req.params.number;
    const numbers = String(number)
      .replace(/ /g, '')
      .split(',')
      .map(x => Number(x))
      .filter(x => !isNaN(x));
    for (const num of numbers) {
      if (!this.validSongNumber(num)) {
        this.showError(res);
        return;
      }
    }
    return this.DB.find({number: {$in: numbers}}).exec().then(docs => {
      res.cache(this.basePath + '/presentation', {
        showSearch: !req.params.number,
        // return the songs in the order they were requested.
        songs: docs.map(doc => this.toSong(doc)).sort((a, b) => {
          return numbers.indexOf(a.number) - numbers.indexOf(b.number);
        }),
      });
    });
  }

  songPage(req, res) {
    const number = req.params.number || this.getCookie(req, 'num') || 1;
    return this.DB.findOne({number: number}).exec().then(doc => {
      this.setCookie(req, 'num', number);
      res.cache(this.basePath + '/layout', this.toSong(doc));
    });
  };

  tocAlphabeticPage(req, res) {
    const songIndex = (req.params.index || 'A')[0].toUpperCase();
    return this.DB.find({azIndex: songIndex})
      .select('title number verses -_id')
      .exec().then(docs => {
        docs.sort((a, b) => this.sortKey(a).localeCompare(this.sortKey(b)));
        const alphaIndexes = docs.map(item => {
          item.summary = item.verses[0].join(' ');
          return item;
        });
        const page = {
          indexes: alphaIndexes,
          songIndex,
          pathPrefix: 'az',
          pageContent: 'index',
          songIndexes: this.hymnalIndexes.az.map(x => x.key)
        };
        this.renderLayout(page, res.serve);
    });
  }

  tocNumericPage(req, res) {
    const songIndex = parseInt(req.params.index, 10) || 1;
    return this.DB.find({number: { $gte: songIndex, $lt: songIndex + 50 }})
      .select('title number verses -_id')
      .exec().then(docs => {
        docs.sort((a, b) => a.number - b.number);
        const numericIndexes = docs.map(item => {
          item.summary = item.verses[0].join(' ');
          return item;
        });
        const page = {
          songIndex,
          pathPrefix: 'numero',
          indexes: numericIndexes,
          songIndexes: this.hymnalIndexes.numbers.map(x => x.key),
          pageContent: 'index',
        };
        this.renderLayout(page, res.serve);
    });
  }

  categoryPage(req, res) {
    const category = req.params.category || this.hymnalIndexes.category[0].title;
    const categoryInfo = this.hymnalIndexes.category.find(
        x => x.subTitle === category || x.title === category);
    return this.DB.find({number: { $gte: categoryInfo.start, $lte: categoryInfo.end }})
      .select('title number verses -_id')
      .exec().then(docs => {
        docs.sort((a, b) => a.number - b.number);
        const categoryIndexes = docs.map(item => {
          item.summary = item.verses[0].join(' ');
          return item;
        });
        const page = {
          categoryInfo,
          indexes: categoryIndexes,
          pageContent: 'category',
          songIndexes: this.hymnalIndexes.numbers.map(x => x.key),
        };
        this.renderLayout(page, res.serve);
    });
  }

  searchPage(req, res) {
    const query = (req.params.query || '').trim();
    if (this.validSongNumber(Number(query))) {
       res.redirect('/' + this.basePath + '/chant/' + query);
       return;
    }
    return this.DB.find(
        {$text: {$search: query}},
        {score: {$meta: 'textScore'}})
      .sort({score:{$meta:'textScore'}})
      .select('title number verses -_id')
      .skip(0)
      .limit(10)
      .exec().then(docs => {
        const page = {
          query,
          songs: (docs || []).map(item => {
            item.summary = item.verses[0].join(' ');
            return item;
          }),
          pageContent: 'results',
        }
        this.renderLayout(page, res.serve);
      });
  };

  homePage(req, res) {
    const page = {
      pageContent: 'home',
    };
    this.renderLayout(page, res.serve);
  };

  get() {
    this.router.get('/presentation/:number', this.slidesPage.bind(this));
    this.router.get('/presentation', this.slidesPage.bind(this));
    this.router.get('/chant/:number', this.songPage.bind(this));
    this.router.get('/chant', this.songPage.bind(this));
    this.router.get('/song/:number', this.songPage.bind(this));
    this.router.get('/song', this.songPage.bind(this));
    this.router.get('/az/:index', this.tocAlphabeticPage.bind(this));
    this.router.get('/az', this.tocAlphabeticPage.bind(this));
    this.router.get('/numero/:index', this.tocNumericPage.bind(this));
    this.router.get('/numero', this.tocNumericPage.bind(this));
    this.router.get('/category/:category', this.categoryPage.bind(this));
    this.router.get('/category', this.categoryPage.bind(this));
    this.router.get('/search/:query', this.searchPage.bind(this));
    this.router.get('/accueil', this.homePage.bind(this));
    this.router.get('/', this.homePage.bind(this));
    return super.get();
  }
}
