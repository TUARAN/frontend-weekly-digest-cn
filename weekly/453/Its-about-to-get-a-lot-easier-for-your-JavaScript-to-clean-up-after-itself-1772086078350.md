# It’s about to get a lot easier for your JavaScript to clean up after itself

# It’s about to get a lot easier for your JavaScript to clean up after itself

[**Mat Marquis**](https://piccalil.li/author/mat-marquis), *10 February 2026*

*Topic:* [JavaScript](https://piccalil.li/category/javascript)

Save 20% on all of our high quality, premium courses using the code `NEXTLEVEL` at checkout
[Transform your career](https://piccalil.li/courses/?utm_source=banner-ad&utm_campaign=next-level-2026)Advert
  
  
According to [the grand unified theory of Muppet types](https://slate.com/life/2012/06/chaos-theory.html), there are two types of JavaScript developer: Chaos Muppets and Order Muppets.

Now, my essential nature is that of a Chaos Muppet. I was born under the “cookies in bed” sign (“fish boomerang” rising). Had I any musical talent, I like to think I’d be more Doctor Teeth than Rowlf; a host more Gonzo than Kermit. This is perhaps best exemplified by the fact that I’m talking about *The Muppets* in an article about proposed JavaScript standards.

When it comes to JavaScript itself, though, I tell you, I’m as buttoned-up as they come — bordering on *fussy*, even. I use `const` by default, and reserve `let` for the relatively rare exception when I *know* the value bound to a variable will need to change; I will brook none of this “change a binding *whenever*” nonsense. What is this, *jazz*? I am *meticulous* about scope and tidying up — freeing resources, closing connections, and so on — despite the absolutely staggering number of utensils I manage to *bork-bork-bork* across the kitchen and into the sink during the course of preparing a real-world meal. Something just comes over me when it comes to JavaScript; I get real “*you are all weirdos,*” all of a sudden.

Those uncharacteristic orderly JavaScript proclivities are the reason my heart sings (on-key, and at a volume that is respectful to its neighboring organs) to see the ongoing work on the [explicit resource management proposal](https://github.com/tc39/proposal-explicit-resource-management). This proposal not only gives us a few new ways to put our objects away when we’re done playing with them, but it codifies some of the ones we already have. To start with, it gives a name to a concept we may already be using today — one that has always resonated at my exact fussiness frequency. You may not know it by name yet, but you’ll likely be familiar with the principle of **implicit resource management** if you’ve ever used a WeakSet or WeakMap.

## [Implicit resource management](https://piccalil.li/blog/its-about-to-get-a-lot-easier-for-your-javascript-to-clean-up-after-itself/#implicit-resource-management)

The “weak” in WeakSet and WeakMap means that their values are “weakly held,” and that means that those data structures won’t prevent the values they reference from being garbage-collected — removed from memory, once those values aren’t needed for anything. Accordingly, a WeakSet or WeakMap can *only* contain garbage-collectable values — references to objects and Symbols that haven’t been added to the global Symbol registry. Trying to add any value other than an object reference or unregistered Symbol will result in an error:

  
### Try it out

```
`const theWeakSet = new WeakSet( [ true ] );`
```
Run
    
  

Once no *other* references to an object or Symbol referenced by a WeakSet exist, not only is that value eligible for garbage collection, but the weakly-held references within the WeakSet are eligible for removal. If that use case sounds pretty niche, well, that’s because it is: you’d use a WeakSet when you need a single collection that can keep track of unique reference values, you don’t want to prevent the referenced values from being garbage collected if nothing else in your script is using them, and you don’t want them included in that collection anymore once that happens. That’s pretty specific stuff.

The same is true of the keys used in a WeakMap: they can be either an object reference or unregistered Symbol value. Once no *other* references to that object or Symbol exist, they become eligible for garbage collection, and the property using that key becomes eligible for removal from the WeakMap. With a WeakMap, you can associate arbitrary values with an object without including those values *in* the object, and without preventing those objects from being garbage-collected:

  
### Try it out
const theObject = {};
const theWeakMap = new WeakMap([
  [ theObject, "A string, say, describing the object." ]
]);

console.log( theWeakMap.get( theObject ) );Run
    
  

Look at that — JavaScript that cleans up after itself! Still a pretty niche use case, but how satisfying; how *tidy*, how *orderly*! Frankly, I wish I got to use it more.

Just like real lifeGarbage collection may be delayed
Granted, we don’t know if or when `theObject` *will* get garbage collected in the previous example. We know that the values in a WeakSet and properties in a WeakMap *can* be garbage collected when no other references to those values or keys exist, but we can’t know when it *will* be garbage collected, and thus actually removed from the WeakSet or WeakMap.

In fact, the previous code snippet isn’t quite telling you the whole story — if you were to follow that thread a little further, you might find that the WeakMap still contains the string we defined even when no other references to `theObject` exist:

Code languagejavascriptCopy *to clipboard*
let theObject = {};
const theWeakMap = new WeakMap([
  [ theObject, "A string, say, describing the object." ]
]);

console.log( theWeakMap.get( theObject ) );
// Result: "A string, say, describing the object."

theObject = true;

console.log( theWeakMap );
// Result: WeakMap { {} → "A string, say, describing the object." }

No matter how order-inclined *we* are, JavaScript itself will always be a little chaotic. The downside of letting JavaScript do its own memory management is that we don’t have much say in the process — the upside is that we don’t *have to*.

Now, as you would rightfully expect, the “explicit resource management” proposal includes more than giving a name to the implicit resource management we’re already able to do. It introduces a unified method — tired old “method” pun intentional — for *explicitly* managing resources, and an addition to the language the likes of which we haven’t seen since 2015.

[Advert![](https://piccalil.b-cdn.net/images/ads/next-level-event-landscape.png?format=webp)](https://piccalil.li/courses/?utm_source=graphical-ad&utm_campaign=next-level-2026)

## [Explicit resource management](https://piccalil.li/blog/its-about-to-get-a-lot-easier-for-your-javascript-to-clean-up-after-itself/#explicit-resource-management)

**Explicit resource management** isn’t about managing memory *directly* — garbage collection is still JavaScript’s problem, not ours. Explicit resource management is about cleaning up after ourselves. This part of the proposal allows us to dictate — either imperatively or declaratively — that a set of actions we’ve defined should be taken once the end state of a **resource** (an object with a knowable “done” state) has been reached.

I know that sounds like a pretty opaque use case in print, but *conceptually*, this isn’t anything new. We already have a model for a resource with a knowable end state, in the form of generator objects:

Code languagejavascriptCopy *to clipboard*
function * generatorFunction() {
  yield true;
  yield false;
};
const generatorObject = generatorFunction();

console.log( generatorObject.next() );
// Result: Object { value: true, done: false }

console.log( generatorObject.next() );
// Result: Object { value: false, done: false }

console.log( generatorObject.next() );
// Result: Object { value: undefined, done: true }

The value of that `done` property is `true` only when a call to `next()` results in an attempt to access an element beyond the final value it yields — the object has reached the end of its **lifetime**.

If you call the `return()` method on that object prior to its natural conclusion, you can end the generator object early:

Code languagejavascriptCopy *to clipboard*
function * generatorFunction() {
  yield true;
  yield false;
};
const generatorObject = generatorFunction();

console.log( generatorObject.next() );
// Result: Object { value: true, done: false }

console.log( generatorObject.return() );
// Result: Object { value: undefined, done: true }

And by using `try … finally` within our generator function, we can specify code to be executed at the end of the generator object’s lifetime, whether that happens naturally:

Code languagejavascriptCopy *to clipboard*
function * generatorFunction() {
  try {
  yield true;
  yield false;
  } finally {
    console.log( "All done." );
  }
};
const generatorObject = generatorFunction();

console.log( generatorObject.next() );
// Result: Object { value: true, done: false }

console.log( generatorObject.next() );
// Result: Object { value: false, done: false }

console.log( generatorObject.next() );
/* Result:
All done.
Object { value: undefined, done: true }
*/

…Or by concluding it via `return()`:

Code languagejavascriptCopy *to clipboard*
function * generatorFunction() {
  try {
  yield true;
  yield false;
  } finally {
    console.log( "All done." );
  }
};
const generatorObject = generatorFunction();

console.log( generatorObject.next() );
// Result: Object { value: true, done: false }

console.log( generatorObject.return() );
/* Result:
All done.
Object { value: undefined, done: true }
*/

Calling `return()` on a generator object is an **imperative** approach to resource management — saying “now, do the following and shut it down, JavaScript” in no uncertain terms. Closing connections to WebSockets by calling `close()`, stopping requests for files with `abort()`, and de-registering an IntersectionObserver with `disconnect()` are all examples of imperative resource management.

As you can see, the syntaxes for doing so are — in strict technical terms — *all over the shop*. Countless methods with inconsistent names dedicated to the exceptionally common task of “close it down and clean it up,” and just like that, my Order Muppet hackles are up. We’ve got a *show* to put on here, people; we’re on a *schedule*. *Can we get all those chickens off the stage, please, Gilda Radner is on in thirty seconds*.

To solve this problem, the explicit resource management proposal standardizes a `[Symbol.dispose]` cleanup method as a wrapper for iterators’ `return()` method:

Code languagejavascriptCopy *to clipboard*
function * generatorFunction() {
  try {
  yield true;
  yield false;
  } finally {
  console.log( "All done." );
  }
};
const generatorObject = generatorFunction();

console.log( generatorObject.next() );
// Result: Object { value: true, done: false }

console.log( generatorObject[Symbol.dispose]() );
// Result: All done.

That’s not a big change in this one context, but the greater implication is huge: introducing `[Symbol.dispose]()` provides us with an orderly, predictable syntax for imperative resource management with [*any* API](https://github.com/tc39/proposal-explicit-resource-management?tab=readme-ov-file#relation-to-dom-apis) that might require cleanup. Closing a file, socket, stream, *whatever*? Call `[Symbol.dispose]()` on the resource in question, and *that* can invoke the cleanup method specific to that resource. Listen, I like an Animal drum solo as much as the next person, but when it comes to JavaScript, I’ll take predictability every time.

[Advert![](https://piccalil.b-cdn.net/images/ads/next-level-event-landscape.png?format=webp)](https://piccalil.li/courses/?utm_source=graphical-ad&utm_campaign=next-level-2026)

Now, as exciting as that is — for very specific values of the word “exciting,” granted — that new predictability paves the way for an far bigger addition to the language. See, when you’re taking an imperative approach to explicit resource management, it’s still on *you* to call `[Symbol.dispose]()` (or `return()`) to do that cleanup — and once you’ve left the scope where references to your resource exist, well, there are no take-backs:

Code languagejavascriptCopy *to clipboard*
{
  function * generatorFunction() {
  console.log( "Open a file." );
  try {
    yield true;
    yield false;
  } finally {
    console.log( "Close the file you still have open." );
  }
  };
  const generatorObject = generatorFunction();

  console.log( generatorObject.next() );
  /* Result:
  Open a file.
  Object { value: true, done: false }
  */
};

console.log( generatorObject[Symbol.dispose]() );
// Uncaught ReferenceError: generatorObject is not defined

Ugh, I should’ve put a warning on this snippet. Avert your eyes, Order Muppets!

Implicit resource management is JavaScript’s problem, but explicit resource management is ours. Node [might make an attempt at closing this file for us](https://nodejs.org/api/fs.html#class-filehandle), but it doesn’t make any promises, either. If this were a WebSocket connection, it would stay open, and a [Web Worker Stream](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) would remain locked. At best, leaving a resource open this way would be a completely unnecessary resource drain; at worse, a source of future errors in our code.

So, with the predictability of a consistent `[Symbol.dispose]` method comes an opportunity for a **declarative** approach to explicit resource management, rather than an imperative one. Since we can predictably call `[Symbol.dispose]()` to say “JavaScript, strike the stage for the next number” no matter what kind of resource we might end working with, it means there’s a go-to way for JavaScript to clean up after itself, so long as we give it a nudge in the right direction.

## [`using`](https://piccalil.li/blog/its-about-to-get-a-lot-easier-for-your-javascript-to-clean-up-after-itself/#using)

The explicit resource management proposal includes an addition to the language that we’ve only seen happen once before, in 2015: a new approach to declaring variables.

A variable declared with the keyword `using` is block-scoped, like `const` and `let` — like `const`, the value of a variable declared with `using` cannot be reassigned. There are no big surprises in terms of the declaration syntax, either — at least, at the surface level:

Code languagejavascriptCopy *to clipboard*
{
  using theVariable = null;

  console.log( theVariable );
  // Result: null
};

The difference is that `using` declares a disposable resource that’s *tied to the lifetime of the variable’s scope*. When the variable is first declared, a **disposer** is retrieved from the object — the value of the `[Symbol.dispose]` property. That disposer is saved to the variable’s scope. Once execution exits the scope where that variable is defined, the disposer is called on the object it references:

  
### Try it out
{
  using theObject = {
    [Symbol.dispose]() {
      console.log( "All done." );
    }
  };
  // About to leave the scope where 
  // theObject is defined, annnd...
};Run
    
  

It’s important to keep in mind that `using` isn’t “cool new `const` that *can* call `[Symbol.dispose]()`.” The value associated with a variable declared with `using` can be any any legal expression, but that expression has to result in a value that’s `null`, `undefined`, or an object with a `[Symbol.dispose]()` method — it serves a very specific purpose, and can only be used for said purpose:

  
### Try it out
{
  using theObject = {};
};Run
    
  

You can also *only* use `using` in context of block scope (a block statement, function body, static initialization block, or as the initializer in the header of a `for`, `for … of`, or `for await … of` loop) or module scope:

  
### Try it out

```
`using theVariable = null;`
```
Run
    
  

Otherwise, `using` without an enclosing scope would would never end up calling `[Symbol.dispose]()`, so there would be no point.

So, knowing all this: remember our generator function that left a file wide open, as though it were *raised in a barn*? If we were to declare `generatorObject` variable with `using` rather than `const`, `[Symbol.dispose]()` — and so, ultimately, `return()` — would be called the moment our variable went out of scope:

  
### Try it out
{
  function * generatorFunction() {
    console.log( "Open a file." );
    
    try {
      yield true;
      yield false;
    } finally {
      console.log( "Close the file." );
    }
  };
  
  using generatorObject = generatorFunction();

  console.log( generatorObject.next() );
};Run
    
  

Oh-ho-ho, we’re [doing the pigeon](https://www.youtube.com/watch?v=VDJsgtoizj8) now! There’s nothing stopping us from calling `[Symbol.dispose]()` (or `return()`) manually, should we need to, of course; it’s not like that method is going away), but we don’t *have* to — we’ve packaged our generator object up in such a way as to know, with certainty, that everything will be tidied up as soon as that variable isn’t needed anymore.

If we were writing a class that needed to clean up after itself once an instance went out of scope? Easy-peasy; we can just write our own disposer that does everything we need it to do:

  
### Try it out
class TheClass {
  theFile;
  constructor( theFile ) {
    this.theFile = theFile;
    console.log( `Open ${ theFile }` );
  }
  
  [Symbol.dispose]() {
    console.log( `Close ${ this.theFile }` );
  }
};

const theFile = "./some-file";

if( theFile ) {
  using fileOpener = new TheClass( theFile );

  console.log( `Do things with the instance of ${ fileOpener.constructor.name }, then...` );
};Run
    
  

No fuss, no muss, and hopefully no more resources trapped forever in limbo, once this proposal lands — and in most browsers it [already has](https://caniuse.com/mdn-javascript_builtins_symbol_dispose). The proposal has reached stage three of the standards process, meaning “recommended for implementation” — and it has been. Everything you’ve seen here will work in every major browser but Safari. Granted, this *is* still a proposal, on paper. I would be remiss in my duties as a rules-following JavaScript Order Muppet if I didn’t mention that some of the syntaxes we’ve covered here *could* change between now and landing in the ECMAScript specification proper. After all, pre-standardization browser implementations of features like this one or [Temporal](https://piccalil.li/blog/date-is-out-and-temporal-is-in/) exist to further refine specifications after we developers have tried them out in a few real-world situations.

So, go on — it’s time to get things started. Try it out for yourself. It may not have *formally* landed yet, but hey, we can flout the specification a little bit, just this once. We don’t *always* have to follow *all* the rules, right?

Just, maybe not in production.

Let’s not get carried away here. *Weirdos*.

Thanks to our very special guest star [Ron Buckton](https://fosstodon.org/@rbuckton), both for reviewing this post and for championing the Explicit Resource Management proposal itself!

    
**Enjoyed this article?** *You can support us by [leaving a tip](https://opencollective.com/piccalilli/contribute/leave-a-tip-90508/checkout?interval=oneTime&amount=3) via Open Collective*

  [![](https://piccalil.li/images/authors/mat-marquis-scaled.jpg)](https://piccalil.li/author/mat-marquis)Author
## Mat Marquis

Independent front-end developer, designer, author of Javascript For Web Designers, JavaScript for Everyone, and hobby collector.
[Check out Mat’s JavaScript Course](https://piccalil.li/javascript-for-everyone/?utm_medium=author-promo)
[ More about Mat Marquis](https://piccalil.li/author/mat-marquis)

  

## 
Take your career to the next level by taking our premium courses and save 20%

Use the code `NEXTLEVEL` at checkout to get our courses for only £249 **£199.20**. By taking our courses, you’re supporting independent publishing, rooted in doing right for workers in design, development and leadership.
[Take your career to the next level](https://piccalil.li/courses)[![](https://piccalil.b-cdn.net/images/ads/next-level-event-square.png?format=webp)](https://piccalil.li/courses)

  
## Newsletter
Newsletter
Join thousands of subscribers and discover our twice weekly newsletter, featuring high quality, curated design, dev and tech links.
Short.~5 links, twice weeklyDigestible.Readable in ~1–2 minsCurated.Good links, curated by humans, not AIFree.Zero cost, and no spam, ever[
Sign up for free

and get the next issue direct to your inbox or RSS reader
](https://piccalil.li/the-index/)
  About
## 
Piccalilli exists to help you produce the best work of your career

Founded by [Andy Bell](https://piccalil.li/author/andy-bell) in 2018, and now also produced by the wider team at [Set.Studio](https://set.studio/), Piccalilli is an independent publisher providing high quality [premium courses](https://piccalil.li/courses), [articles](https://piccalil.li/blog) and a [newsletter](https://piccalil.li/the-index).
[More about Piccalilli](https://piccalil.li/about)[![](https://piccalil.b-cdn.net/images/circle-arrow-north-east.png?format=webp)](https://piccalil.li/about)