import {PAGE, SLICE} from './constants'

/**
 * Show partial results and give indexes for jump to next results.
 * @param {Array<Object>} arr - list to paginate
 * @param {number} page - page number to show
 * @param {number} slice - maximum of number per page
 * @param {boolean} [reverse=true] - True to show latest item first
 * @param {boolean} [hidePages=false] - True to show inner page numbers
 * @return {{
 *  data: Arrray<Object>,
 *  start: number,
 *  end: number,
 *  page: number,
 *  prev: number,
 *  next: number,
 *  last: number,
 *  pages: Array<number>
 * }} - paginatino info
 */
export function paginate(arr: Array<any>, page=PAGE, slice=SLICE,
    reverse=true, hidePages=false) {
  if (page < 1)
    page = 1;
  if (slice < -1)
    slice = 10;
  if (slice > 25){
    slice = 25;
  }

  if (arr){
    if (reverse === true)
      arr = arr.reverse();
  }
  else
    arr = [];
  const count = arr.length;
  let start = 1 + ((page-1) * slice);
  let end = slice + ((page-1) * slice);

  arr = arr.slice(start-1, end);
  if (count < end) {
    arr = arr.slice(0, count % slice);
  }

  const prev = page > 1 ? (page - 1): false;
  const next = count > end ? (page + 1): false;
  start = count > 0 ? start: 0;
  end = count > end ? end: count;
  const result = {
    data: arr,
    start: start,
    end: end,
    next: next,
    prev: prev,
    count: count
  };
  if (hidePages) {
    return {
      ...result,
      slice
    }
  }
  return {
    ...result,
    page,
    last: Math.ceil(count / slice),
    pages: getPages(page, slice, count, 7),
  }
};


/**
 * Pagination helper.
 * @param {number} current - index for the current page
 * @param {number} slice - how many item per page
 * @param {number} total - number of item in the list to paginate
 * @param {number} size - len of the array
 * @return {Array<string>} page indexes to jump to.
 */
function getPages(current: number, slice: number, total: number, size: number) {
  size--;
  const max = Math.ceil(total / slice);
  if (max < size)
    size = max;
  let end = current + Math.ceil(size/2);
  let start = end - size;
  if (start < 1){
    end = end - start;
    start = 1;
  }
  if (end > max)
    end = max;
  if (start < 1)
    start = 1;  

  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}


/**
 * Helper function slice array into multiple chunk.
 * @param {Array<T>} Array to partition
 * @param {number} chunkSize how many arrays to produce
 * @return {Array<Array<T>}
 */
export function chunk(arr: Array<any>, chunkSize: number) {
  const result  = [];
  for (var i=0,len=arr.length; i<len; i+=chunkSize)
    result.push(arr.slice(i,i+chunkSize));
  return result;
}


export function resolve(err, res, body={}) {
  if (err) {
    res.statusCode = 500;
    res.send({success: false});
  }
  else {
    res.send({...body, success: true});
  }
};
