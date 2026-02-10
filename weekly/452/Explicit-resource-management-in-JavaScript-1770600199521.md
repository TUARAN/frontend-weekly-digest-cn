# Explicit resource management in JavaScript

## Explicit resource management in JavaScript

      

  
    
      
        
      
    
  
  

  
    3 min read
  

  
    
      
      
        1227
      
      
      views
    
  

    
    
      
Writing JavaScript that opens something (a file, a stream, a lock, a database connection) also means remembering to clean it up. And if we’re being honest, that cleanup doesn’t always happen. I know I’ve missed it more than once.

JavaScript has always made this our problem. We reach for `try / finally`, tell ourselves we’ll be careful, and hope we didn’t miss an edge case. It usually works, but it’s noisy and easy to get subtly wrong. It also scales poorly once you’re juggling more than one resource.

That’s finally starting to change. **Explicit resource management** gives JavaScript a first-class, language-level way to say, “This thing needs cleanup, and the runtime will guarantee it happens.”

Not as a convention or a pattern, but as part of the language.

## We’re bad at cleanup (and the language doesn’t help)

This pattern should look familiar:

const file = await openFile("data.txt");

try {
  // do something with file
} finally {
  await file.close();
}

This is fine, but also:

  - Verbose

  - Repetitive

  - Easy to mess up as complexity grows, especially during refactors

Now add *another* resource:

const file = await openFile("data.txt");
const lock = await acquireLock();

try {
  // work with file and lock
} finally {
  await lock.release();
  await file.close();
}

Now order matters. Error paths matter. You *can* reason through all of this, but the mental overhead keeps creeping up. And once it’s there, bugs tend to follow.

Other languages solved this years ago. JavaScript is (slowly) catching up.

📌 Dive further into async

`await` in loops isn’t always what you think. Here’s where [things start to break down](https://allthingssmitty.com/2025/10/20/rethinking-async-loops-in-javascript/).

## `using`: cleanup, but make it the runtime’s job

At a high level, `using` declares a resource that will be **automatically cleaned up when it goes out of scope**.

Conceptually:

using file = await openFile("data.txt");

// do something with file

// file is automatically closed at the end of this scope

No `try`. No `finally`. No “did I remember to close this?”

The key shift is that cleanup is tied to **lifetime**, not control flow.

## How cleanup actually works

Resources opt in by implementing a well-known symbol:

  - `Symbol.dispose` for synchronous cleanup

  - `Symbol.asyncDispose` for asynchronous cleanup

For example:

class FileHandle {
  async write(data) {
    /* ... */
  }

  async [Symbol.asyncDispose]() {
    await this.close();
  }
}

Once a value has one of these methods, it can be used with `using`.

And importantly, `using` **doesn’t magically close files**, it just standardizes cleanup instead of every library inventing its own.

## When you need `await using`

If cleanup is asynchronous, you’ll typically use `await using`:

await using file = await openFile("data.txt");

// async work with file

When the scope ends, JavaScript will *await* disposal before continuing.

Synchronous resources (locks, in-memory structures) can use plain `using`. It may feel odd at first, but it matches how JavaScript already draws the line between sync and async elsewhere. What matters is that cleanup happens at scope exit.

📌 Designing for async

`Array.fromAsync()` is one sign JavaScript is finally treating async as a first-class concern: [modern async iteration in JavaScript](https://allthingssmitty.com/2025/07/14/modern-async-iteration-in-javascript-with-array-fromasync/).

## Stacking resources without the headache

This is where things really improve.

Instead of:

const file = await openFile("data.txt");
const lock = await acquireLock();

try {
  // work
} finally {
  await lock.release();
  await file.close();
}

You write:

await using file = await openFile("data.txt");
using lock = await acquireLock();

// work

Cleanup happens automatically, **in reverse order**, like a stack:

  - `lock` is released

  - `file` is closed

No extra syntax. Errors don’t short-circuit disposal, and cleanup happens in a defined order.

## Scope is the point

A `using` declaration is scoped just like `const` or `let`:

{
  await using file = await openFile("data.txt");
  // file is valid here
}

// file is disposed here

This pushes you toward tighter scopes and makes lifetimes explicit, something JavaScript has historically been bad at expressing. Once you start seeing lifetimes in the code itself, it’s hard to unsee.

## When `using` isn’t enough

Not every resource fits neatly into a block. Sometimes acquisition is conditional, or you’re refactoring older code and don’t want to introduce new scopes everywhere.

That’s where `DisposableStack` and `AsyncDisposableStack` come in:

const stack = new AsyncDisposableStack();

const file = stack.use(await openFile("data.txt"));
const lock = stack.use(await acquireLock());

// work with file and lock

await stack.disposeAsync();

You get the same safety as `using`, with more flexibility. If `using` is the clean, declarative case, stacks are the escape hatch.

## This isn’t just a back-end feature

At first glance this can feel like a server-side concern, but it applies just as much on the front end and in platform code:

  - Web Streams

  - `navigator.locks`

  - Observers and subscriptions

  - IndexedDB transactions

Anyone who’s written `subscribe()` / `unsubscribe()` or `open()` / `close()`, this should at least make you pause.

This isn’t just about correctness. It’s about **making lifetimes visible in the code** instead of hiding them in conventions and comments.

## What’s the catch?

As of early 2026, Chrome 123+ and Firefox 119+ support all of these features. Node.js 20.9+, too. **Safari support is still pending**, but it’s on their radar.

For now, it’s something to experiment with and maybe start designing APIs around, especially if you maintain libraries or platform-level abstractions. Even if you’re not using `using` tomorrow, the model it introduces is worth paying attention to.

## A better default for cleanup

Explicit resource management doesn’t replace `try / finally`. You’ll still use it when you need fine-grained control.

What it does give us is a better default: less boilerplate, fewer leaks, clearer intent, and code that just reads better. As JavaScript takes on more systems-like responsibilities, features like this feel less like nice-to-haves and more like table stakes.

      
  
    
      
        - [JavaScript](https://allthingssmitty.com/tags/javascript)

      
    
  

    
    
    
  

   
  [Previous post](https://allthingssmitty.com/2026/01/12/stop-turning-everything-into-arrays-and-do-less-work-instead/)
    

  Please enable JavaScript to view the
  [comments powered by Disqus.](https://disqus.com/?ref_noscript)