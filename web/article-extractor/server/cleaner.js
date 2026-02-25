const cheerio = require('cheerio');

function basicClean(html) {
  const $ = cheerio.load(html);

  // remove scripts, styles, nav, footer, aside, ads, forms
  $('script, style, nav, footer, aside, noscript, form').remove();
  $('[class*="cookie"]').remove();
  $('[class*="advert"]').remove();
  $('[id*="advert"]').remove();
  $('[class*="ad-"]').remove();

  // remove common selectors
  $('[role="banner"]').remove();
  $('[role="complementary"]').remove();
  $('[role="navigation"]').remove();

  // attempt to find main/article container
  let main = $('article').first();
  if (!main || !main.length) {
    main = $('main').first();
  }
  if (!main || !main.length) {
    // try heuristics: element with class containing 'content' or 'article'
    main = $('[class*="content"]').first();
  }
  if (!main || !main.length) {
    main = $('[class*="post"]').first();
  }
  // fallback to body
  if (!main || !main.length) main = $('body');

  // clone and prune the main
  const clone = main.clone();
  // remove scripts/styles within
  clone.find('script, style, iframe, svg, canvas, form, .share, .related, .comments').remove();

  // extract metadata
  const title = ($('meta[property="og:title"]').attr('content') || $('title').text() || clone.find('h1').first().text() || '').trim();
  const author = ($('[rel="author"]').first().text() || $('[class*="author"]').first().text() || '').trim();
  const date = ($('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || $('time').text() || '').trim();

  // ensure img/video tags keep src attributes
  clone.find('img').each((i, el) => {
    const $el = $(el);
    // keep src attribute as-is
    // remove sizes/srcset if you want to simplify
    $el.removeAttr('srcset');
    $el.removeAttr('sizes');
  });

  const cleanHtml = clone.html() || '';
  const metadata = { title, author, date };
  return { cleanHtml, metadata };
}

module.exports = { basicClean };

