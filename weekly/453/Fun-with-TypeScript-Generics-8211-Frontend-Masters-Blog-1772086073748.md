# Fun with TypeScript Generics &#8211; Frontend Masters Blog

[Generics](https://frontendmasters.com/blog/tag/generics/)[TypeScript](https://frontendmasters.com/blog/tag/typescript/)    
      
    
      Fun with TypeScript Generics    

    
      ![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2024/04/FwXKVe5H_400x400.jpg?fit=96%2C96&#038;ssl=1)
      
                Adam Rackis
      on
      February 13, 2026
    

    
      

Generics are an incredibly powerful feature of [TypeScript](https://www.typescriptlang.org/). There&#8217;s endless content on TypeScript in general, and generics in particular. This post will differ a bit and cover things more deeply.

This won&#8217;t be a generic introduction to generics (pun intended). Instead, we&#8217;ll implement a very, very niche use case, and in the process cover some advanced uses for generics, plus conditional types, and some other goodies.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#a-quick-refresher-on-generics-conditional-types)A Quick Refresher on Generics & Conditional Types

Let&#8217;s take a very, very fast introduction to the key concepts of this post. We&#8217;ll use extremely contrived examples to keep everything as brief as possible.

If you&#8217;re already an expert, just scroll past. If you&#8217;re not sure, give it a read, and if what&#8217;s in this section isn&#8217;t old hat, you might want to read some refresher materials before tackling the rest of this post.

### [](https://frontendmasters.com/blog/fun-with-typescript-generics/#generics)Generics

Think of generics as function parameters that are types. What do I mean by that? Normally function parameters are *values* (or references to a value, but we won&#8217;t bother with that).

function arrayLength(arr: any&#91;]) {
  return arr.length;
}Code language: TypeScript (typescript)

Here, `arr` is an array. Right now, it&#8217;s an array of `any`. If we wanted, we could type this array a bit more accurately by adding a generic argument.

function arrayLengthTyped<T>(arr: T&#91;]) {
  return arr.length;
}Code language: TypeScript (typescript)

Now, whenever we call this method and pass an array, the generic argument `T` will infer to whatever the type of the array is. Make no mistake, even though `T` makes this method definition more accurate, it&#8217;s completely pointless. The original method was perfectly fine. The value of `arr` is an array of `any`, but it doesn&#8217;t matter; no matter what the elements of the array are, the `.length` property will always be there.

Let’s go from one pointless function to another. Let’s implement our own filter.

function filterUntyped(array: any&#91;], predicate: (item: any) => boolean): any&#91;] {
  return array.filter(predicate);
}Code language: TypeScript (typescript)

This time we actually have a problem. There&#8217;s absolutely no checking done on the predicate function we pass in.

type User = {
  name: string;
};

const users: User&#91;] = &#91;];

filterUntyped(users, user => user.nameX === "John");Code language: TypeScript (typescript)

We’re passing in a function that takes each member of the array, but we’re clearly misusing it; there is no nameX property on each user. This is where generics shine.

function filterTyped<T>(array: T&#91;], predicate: (item: T) => boolean): T&#91;] {
  return array.filter(predicate);
}Code language: TypeScript (typescript)

Now TypeScript will verify everything.

filterTyped(users, user => user.nameX === "John");
*// -----------------------------^^^^^*
*// Property 'nameX' does not exist on type 'User'. Did you mean 'name'?*

We can even limit generic arguments. What if we have a bunch of different user types?

type User = {
  name: string;
};

type AdminUser = User & {
  role: string;
};

type BannedUser = User & {
  reason: string;
};Code language: TypeScript (typescript)

For whatever strange reason, we wanted to take the `filterTyped` function from before.

function filterTyped<T>(array: T&#91;], predicate: (item: T) => boolean): T&#91;] {
  return array.filter(predicate);
}Code language: TypeScript (typescript)

But this time have it only works with any `User` type.

If you&#8217;re thinking *just ditch the generics altogether and&#8230;*

function filterUser(array: User&#91;], predicate: (item: User) => boolean): User&#91;] {
  return array.filter(predicate);
}Code language: TypeScript (typescript)

&#8230;not so fast. This function, while appealing, winds up erasing our return type.

const adminUsers: AdminUser&#91;] = &#91;];
const adminUsersNamedAdam = filterUser(adminUsers, user => user.name === "Adam");Code language: TypeScript (typescript)

The variable `adminUsersNamedAdam` is typed as `User[]`, and how could it not be? `filterUser` is explicitly typed to return `User[].`

The correct solution is to go back to the generic version, but *restrict* the acceptable values for T.

function filterUserCorrect<T extends User>(array: T&#91;], predicate: (item: T) => boolean): T&#91;] {
  return array.filter(predicate);
}Code language: TypeScript (typescript)

Now our return type is correctly inferred: it&#8217;s the exact same type that we pass in for the array. But we’re only able to invoke it with a type that matches the `User` type, which is to say, has a `name` property that’s a string.

### [](https://frontendmasters.com/blog/fun-with-typescript-generics/#conditional-types)Conditional Types

Conditional types allow us to, essentially, *ask questions* about types and form new types based on the answers.

type IsArray<T> = T extends any&#91;] ? true : false;

type YesIsArray = IsArray<number&#91;]>;
type NoIsNotArray = IsArray<number>;Code language: TypeScript (typescript)

Here `YesIsArray` is the literal type `true` while `NoIsNotArray` is the literal type `false`. This is obviously pointless; the real value of conditional types usually comes with inferred types.

type ArrayOf<T> = T extends Array<infer U> ? U : never;

type NumberType = ArrayOf<number&#91;]>;
type NeverType = ArrayOf<number>;Code language: HTML, XML (xml)

Here the `Number` type is `number` and the NeverType type is, predictably, `never`. And yes, we can (and should) use generic constraints with these helper types

type ArrayOf2<T extends Array<any>> = T extends Array<infer U> ? U : never;

type NumberType2 = ArrayOf2<number&#91;]>;
type NeverType2 = ArrayOf2<number>;
// ------------------------^^^^^^^
// Type 'number' does not satisfy the constraint 'any&#91;]'Code language: JavaScript (javascript)

Now we&#8217;re forbidden from using `ArrayOf2` with any type that&#8217;s not an array of something, so we&#8217;ll never have to worry about getting `never` back.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#lets-get-started)Let&#8217;s Get Started

I recently wrote [a two-part post on single flight mutations](https://frontendmasters.com/blog/single-flight-mutations-in-tanstack-start-part-1/) using [TanStack Start](https://tanstack.com/start/latest). In order to make that work, we very carefully put together react-query options. Our query functions (which do the actual data fetching) were purposefully designed to be a single call against a TanStack Server Function. Then that same query function, as well as the argument payload it takes, were placed on react-query&#8217;s `meta` option.

Then, in middleware on the server, we received query keys and looked up the server function and argument payload for a query so we could refetch its data.

As part of those efforts, we built a simple helper to remove the duplication between the query function and the meta option.

export function refetchedQueryOptions(queryKey: QueryKey, serverFn: any, arg?: any) {
  const queryKeyToUse = &#91;...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}Code language: TypeScript (typescript)

It’s a helper that takes in the query key, the server function, and argument payload, if any, and returns back *some* of our query options. It does this so the query function, and meta option will always be in sync with whatever server function is fetching our data. Then we compose it like this.

export const epicsQueryOptions = (page: number) => {
  return queryOptions({
    ...refetchedQueryOptions(&#91;"epics", "list"], getEpicsList, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};Code language: TypeScript (typescript)

This proof-of-concept version worked fine, but nothing was typed. Our server function and argument payload were both marked as `any`, which didn’t just fail to restrict invalid argument payloads, but also, disastrously, led all query hooks that used this to report the queried data as `any`.

This post will implement a fully typed version of our `refetchedQueryOptions` function. It&#8217;s much harder than it might appear!

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#our-success-criteria)Our Success Criteria

Here&#8217;s our complete test setup.

import { QueryKey, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

// ============================ Current Implementation ============================

export function refetchedQueryOptions(queryKey: QueryKey, serverFn: any, arg?: any) {
  const queryKeyToUse = &#91;...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}

// ============== Server Functions for testing ==============

const serverFnWithArgs = createServerFn({ method: "GET" })
  .inputValidator((arg: { value: string }) => arg)
  .handler(async () => {
    return { value: "Hello World" };
  });

const serverFnWithoutArgs = createServerFn({ method: "GET" }).handler(async () => {
  return { value: "Hello World" };
});

// ============================ Tests ============================

refetchedQueryOptions(&#91;"test"], serverFnWithArgs, { value: "" });
refetchedQueryOptions(&#91;"test"], serverFnWithoutArgs);

// wrong argument type
// FAILS - Unused '@ts-expect-error' directive.
// @ts-expect-error
refetchedQueryOptions(&#91;"test"], serverFnWithArgs, 123);

// need an argument
// FAILS - Unused '@ts-expect-error' directive.
// @ts-expect-error
refetchedQueryOptions(&#91;"test"], serverFnWithArgs);Code language: TypeScript (typescript)

At the top we have the current iteration of our `refetchedQueryOptions` method. Beneath that, we have some server functions that will help us test this, one with an argument, the other without. And beneath that, we see four calls to `refetchedQueryOptions` to validate that our type checking is working properly. The top two we expect to succeed, and the bottom two we expect to error, which we verify with the `// @ts-expect-error` directive. This directive, well, *expects* an error on the very next line. If there is an error on the very next line, all is well; if there is no error on the next line, the `@ts-expect-error` directive will itself raise an error.

Above, with our initial implementation, we see our expected errors fail to error out. This makes sense, since everything is typed as `any`, and our `arg` parameter is optional, so really anything goes.

Even if you&#8217;re more than willing to live with imperfect typings, this current solution isn&#8217;t good for much. Since `serverFn` is typed as any, our `queryFn` will return `any`. That means any application code that&#8217;s using `useQuery` or `useSuspenseQuery` will now spit out `any` for your data.

The rest of this post will get everything typed properly. We&#8217;ll have to do some unhinged things, so hopefully we&#8217;ll learn something new and maybe even have some fun.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#iteration-1)Iteration 1

How&#8217;s this for a minimal improvement? Right now, the lack of a return type for the server function is absolutely killing us. Any usage of this query data will give use `any`. We *really* want our data properly typed in application code.

TanStack Server functions are just&#8230; *functions*. They&#8217;re special in that you can call them from the client or the server, but at the end of the day, they&#8217;re functions. They always take in a single argument that has a `data` property for the standard arguments your function has defined (it also allows you to pass things like headers, but we won&#8217;t worry about that, here).

Couldn&#8217;t we add a generic to our function, representing the server function? Once we have a function, we can use TypeScript&#8217;s built-in `Parameters` and `ReturnType` helpers. Let&#8217;s see what that looks like.

export function refetchedQueryOptions<T extends (arg: { data: any }) => Promise<any>>(
  queryKey: QueryKey,
  serverFn: T,
  arg: Parameters<T>&#91;0]&#91;"data"],
) {
  const queryKeyToUse = &#91;...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async (): Promise<Awaited<ReturnType<T>>> => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}
Code language: TypeScript (typescript)

We constrain our generic to be a function that takes in an `arg` with a `data` property. Moreover, we can now *use* our `T` generic in the parameter definition of `arg`, here `arg: Parameters<T>[0]["data"]`. Whatever our function is, we say that `arg` is the same type as the `data` property on the main argument that the function takes in.

How does this look? Let&#8217;s check our tests

refetchedQueryOptions(&#91;"test"], serverFnWithArgs, { value: "" });
refetchedQueryOptions(&#91;"test"], serverFnWithoutArgs);
// Error: Expected 3 arguments, but got 2.

// wrong argument type
// @ts-expect-error
refetchedQueryOptions(&#91;"test"], serverFnWithArgs, 123);

// need an argument
// @ts-expect-error
refetchedQueryOptions(&#91;"test"], serverFnWithArgs);Code language: TypeScript (typescript)

We have one problem. It seems we need to pass an argument for the query function which… doesn’t take any parameters. It makes sense: `refetchedQueryOptions` does indeed define an `arg` parameter, which needs to be passed. I&#8217;ll be quick to note that simply passing `undefined` for that arg works perfectly.

```
`refetchedQueryOptions(&#91;"test"], serverFnWithoutArgs, undefined);`Code language: TypeScript (typescript)
```

This solves all our problems; our test code now has zero errors. For the vast, vast majority of apps, this will likely be fine. It&#8217;s entirely possible the work I&#8217;m about to show you to improve on this may not be worth the effort. *But*, going through that effort will likely teach us some neat things about TypeScript, and if we&#8217;re a special kind of strange, may even be fun.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#false-prophets)False Prophets

You might think making arg optional would solve all our problems. Unfortunately, when we do that, `arg` becomes optional *everywhere*, including places we want to require it

// need an argument
// FAILS - Unused '@ts-expect-error' directive.
// @ts-expect-error
refetchedQueryOptions(&#91;"test"], serverFnWithArgs);Code language: TypeScript (typescript)

If you&#8217;re an advanced TypeScript user you might think a conditional type is what we need. Detect the inferred arg type (what&#8217;s in the `data` arg), and if it&#8217;s not undefined, require it, but if it *is* undefined, then *don&#8217;t* require it. Unfortunately, there&#8217;s not really an easy way to represent &#8220;pass nothing&#8221; as the result of a conditional type. I&#8217;ve tried, and I was never able to get things fully working. I may have been missing something (feel free to drop a comment if you can figure it out), but even if there&#8217;s a trick to make it work, there&#8217;s a much more straightforward, idiomatic solution.

We essentially want different function signatures in different circumstances: we want an arg when the server function we pass in takes an arg, and we want no arg when the server function we pass in takes no arg. Different function signatures is usually referred to as function overloading in computer science, and TypeScript supports this.

### [](https://frontendmasters.com/blog/fun-with-typescript-generics/#function-overloading-in-typescript)Function Overloading in TypeScript

As the simplest possible example, imagine you wanted to write an `add` function with two versions: one that takes in two numbers, and adds them; and one that takes in two strings, and concatenates them. Conceptually, we want this:

function add(x: number, y: number): number {
  return x + y;
}

function add(x: string, y: string): string {
  return x + y;
}Code language: TypeScript (typescript)

But that&#8217;s not valid; since JavaScript is a dynamically typed language, you can&#8217;t have more than one function of the same name, in the same scope. *TypeScript* does, however, allow us to overload functions, but the mechanics are a bit different. Here&#8217;s how we do this:

function add(x: number, y: number): number;
function add(x: string, y: string): string;
function add(x: string | number, y: string | number): string | number {
  if (typeof x === "string" && typeof y === "string") {
    return x + y;
  }
  if (typeof x === "number" && typeof y === "number") {
    return x + y;
  }
  throw new Error("Invalid arguments");
}Code language: TypeScript (typescript)

We start with the function *definitions*. This one:

```
`function add(x: number, y: number): number;`Code language: TypeScript (typescript)
```

And this one:

```
`function add(x: string, y: string): string;`Code language: TypeScript (typescript)
```

These define the actual API of our function. We declare that this function can take in two numbers and return a number, or two strings and return a string.

Then we have the actual implementation of the function.

function add(x: string | number, y: string | number): string | number {
  if (typeof x === "string" && typeof y === "string") {
    return x + y;
  }
  if (typeof x === "number" && typeof y === "number") {
    return x + y;
  }
  throw new Error("Invalid arguments");
}Code language: TypeScript (typescript)

The inputs and return types all have to be a union of every definition. In other words, the actual implementation has to accept any of the definitions.

And now, when we try to call this function, we only see the definitions available to us.

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/img1.png?resize=674%2C174&#038;ssl=1)

![](https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/02/img2.png?resize=678%2C188&#038;ssl=1)

The implementation is a little weird. You might wonder why we need

```
`throw new Error("Invalid arguments");`Code language: TypeScript (typescript)
```

The only valid invocations for this function are two strings or two numbers; that&#8217;s all TypeScript will allow. So why does TypeScript require us to have that throw at the end? If both arguments are not strings, and neither argument is a number, the function will never be allowed. Unfortunately, TypeScript isn&#8217;t quite smart enough to understand that. The function implementation has x and y both as `string | number` so as far as it&#8217;s concerned, `x` could be a string and `y` could be a number. Understanding that this combination is disallowed by the prior overload definitions isn&#8217;t currently within TypeScript&#8217;s capabilities.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#building-our-solution)Building Our Solution

So we want to overload `refetchedQueryOptions` twice: once for a server function that takes in an argument, and once for a server function that takes no arguments. How do we define either case? This is where things get fun.

To start, let&#8217;s define a type representing any async function

```
`type AnyAsyncFn = (...args: any&#91;]) => Promise<any>;`Code language: TypeScript (typescript)
```

This seems like a waste of time, but it&#8217;ll save us some typing and add a lot of clarity soon.

Let’s define a type that takes in an async function and just strips out the argument type. A conditional type is perfect for this. We saw something similar before with a conditional type that strips out the type of an array&#8217;s elements.

```
`type ArrayOf<T extends Array<any>> = T extends Array<infer U> ? U : never;`Code language: TypeScript (typescript)
```

We check that T extends an array, and then we plopped `infer U` right into the generic slot the Array type already has. Let&#8217;s do something similar to get the parameter type of an async function.

```
`type ServerFnArgs<TFn extends AnyAsyncFn> = Parameters<TFn>&#91;0] extends { data: infer TResult } ? TResult : undefined;`Code language: TypeScript (typescript)
```

There&#8217;s a `Parameters<T>` type that can pluck parameters out of a function type. We grab the zero&#8217;th parameter (functions can have multiple parameters, but server functions only have one). On that single, 0th parameter, look for a `data` property, and if present, infer that. Otherwise return undefined.

From there we can start to ask questions about our types.

```
`type ServerFnHasArgs<TFn extends AnyAsyncFn> = ServerFnArgs<TFn> extends undefined ? false : true;`Code language: TypeScript (typescript)
```

And we can then make other type helpers.

type ServerFnWithArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends true ? TFn : never;
type ServerFnWithoutArgs<TFn extends AnyAsyncFn> = ServerFnHasArgs<TFn> extends false ? TFn : never;Code language: TypeScript (typescript)

We&#8217;ve built some helper types that take a function type in, and tests whether that function has, or does not have server function arguments.

One major bummer of TypeScript overloading is that we can&#8217;t rely on inferred return types, so we&#8217;ll have to define our return type manually.

type RefetchQueryOptions<T> = {
  queryKey: QueryKey;
  queryFn: (_?: any) => Promise<T>;
  meta: any;
};Code language: TypeScript (typescript)

And with that, we should be ready to define our overload signatures.

export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithArgs<TFn>,
  arg: Parameters<TFn>&#91;0]&#91;"data"],
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;
export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithoutArgs<TFn>,
): RefetchQueryOptions<Awaited<ReturnType<TFn>>>;Code language: TypeScript (typescript)

One version for a Server Function that takes an argument, as well as the argument, and a version for a Server Function that takes no argument, with no such argument passed.

The full implementation:

export function refetchedQueryOptions<TFn extends AnyAsyncFn>(
  queryKey: QueryKey,
  serverFn: ServerFnWithoutArgs<TFn> | ServerFnWithArgs<TFn>,
  arg?: Parameters<TFn>&#91;0]&#91;"data"],
): RefetchQueryOptions<Awaited<ReturnType<TFn>>> {
  const queryKeyToUse = &#91;...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return {
    queryKey: queryKeyToUse,
    queryFn: async () => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  };
}Code language: TypeScript (typescript)

And that&#8217;s that.

Generics, combined with conditional types, can make for an incredibly powerful combination. When you look at things the right way, you can ask very useful questions about your types that allow you to build the precise API you want.

## [](https://frontendmasters.com/blog/fun-with-typescript-generics/#concluding-thoughts)Concluding Thoughts

I hope this deep dive into a niche use case has taught you at least something useful about TypeScript. Even if you never need to solve this particular problem — and let&#8217;s face it, you probably won&#8217;t — these tools and skills are widely applicable.

    
    
  

  

        
### Wanna learn TypeScript deeply?

        
          
            ![](https://frontendmasters.com/blog/wp-content/themes/fem-v3/images/course-shoutouts/typescript.png)
          

              
We have [a complete learning path for TypeScript](https://frontendmasters.com/learn/typescript/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=fun-with-typescript-generics) from Mike North, one of Stripe's deepest TypeScript experts, who will teach you from early fundamentals to production-grade TypeScript. Access 300+ courses with a Frontend Masters subscription and [get 20% off today!](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=fun-with-typescript-generics)

          
            - Personalized Learning

            - Industry-Leading Experts

            - 24 Learning Paths

            - Live Interactive Workshops

          

          20% Off
          [Start Learning Today &rarr;](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=fun-with-typescript-generics)
        

  
    

			

	
	
		
### Leave a Reply [Cancel reply](https://frontendmasters.com/blog/fun-with-typescript-generics/#respond)

Your email address will not be published. Required fields are marked *

Comment * 

Name * 

Email * 

Website 

 Save my name, email, and website in this browser for the next time I comment.

 

&#916;
	
	  

  

  
    
    
      
### Table of Contents

      
        - [A Quick Refresher on Generics & Conditional Types](https://frontendmasters.com/blog/fun-with-typescript-generics/#a-quick-refresher-on-generics-conditional-types)[Generics](https://frontendmasters.com/blog/fun-with-typescript-generics/#generics)
- [Conditional Types](https://frontendmasters.com/blog/fun-with-typescript-generics/#conditional-types)
- [Let’s Get Started](https://frontendmasters.com/blog/fun-with-typescript-generics/#lets-get-started)
- [Our Success Criteria](https://frontendmasters.com/blog/fun-with-typescript-generics/#our-success-criteria)
- [Iteration 1](https://frontendmasters.com/blog/fun-with-typescript-generics/#iteration-1)
- [False Prophets](https://frontendmasters.com/blog/fun-with-typescript-generics/#false-prophets)[Function Overloading in TypeScript](https://frontendmasters.com/blog/fun-with-typescript-generics/#function-overloading-in-typescript)
- [Building Our Solution](https://frontendmasters.com/blog/fun-with-typescript-generics/#building-our-solution)
- [Concluding Thoughts](https://frontendmasters.com/blog/fun-with-typescript-generics/#concluding-thoughts)
    

    
      
### Did you know?

      
Our courses go beyond frontend into fullstack, devops, and AI.

      &rarr; [Explore courses (20% off)](https://frontendmasters.com/join/?code=blog20&utm_source=boost&utm_medium=blog&utm_campaign=the-deep-card-conundrum)